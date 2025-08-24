import { DATA_BASE_URL } from '../Config';
import type {
    ByproductGroup,
    HistoricalDropTablesData,
    HistoricalItemsData,
    HistoricalRecipesData,
    ProcessedDropSource,
    ProcessedItem,
    ProcessedMaterial,
    ProcessedRecipe,
    RawDrop, RawObjectSource
} from '../types/GameData';

let processedItemsCache: Map<number, ProcessedItem> | null = null;
let itemsByCategoryCache: Map<number, ProcessedItem[]> | null = null;
export const getItems = async (): Promise<Map<number, ProcessedItem>> => {
    if (processedItemsCache) return processedItemsCache;
    try {
        const response = await fetch(`${DATA_BASE_URL}historical_items.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const rawData: HistoricalItemsData = await response.json();
        const itemMap = new Map<number, ProcessedItem>();
        const categoryMap = new Map<number, ProcessedItem[]>();
        for (const itemId in rawData.items) {
            const versions = rawData.items[itemId];
            const latestVersionKey = Object.keys(versions).sort().pop();
            if (latestVersionKey) {
                const data = versions[latestVersionKey];
                const processedItem: ProcessedItem = {
                    id: data.itemId,
                    name: { en: data.itemName_EN, ja: data.itemName_JA },
                    description: { en: data.itemDescription_EN, ja: data.itemDescription_JA },
                    icon: data.iconResourceName,
                    category: { id: data.categoryId, en: data.category.name_EN, ja: data.category.name_JA },
                    extraData: data.extra_data,
                };
                itemMap.set(data.itemId, processedItem);
                if (!categoryMap.has(data.categoryId)) categoryMap.set(data.categoryId, []);
                categoryMap.get(data.categoryId)!.push(processedItem);
            }
        }
        processedItemsCache = itemMap;
        itemsByCategoryCache = categoryMap;
        return itemMap;
    } catch (error) { console.error("Failed to fetch item data:", error); return new Map(); }
};

export const getItemsByCategory = async (): Promise<Map<number, ProcessedItem[]>> => {
    if (itemsByCategoryCache) return itemsByCategoryCache;
    await getItems();
    return itemsByCategoryCache!;
};

let recipesCache: ProcessedRecipe[] | null = null;
export const getAllRecipes = async (): Promise<ProcessedRecipe[]> => {
    if (recipesCache) return recipesCache;
    const itemMap = await getItems();
    try {
        const response = await fetch(`${DATA_BASE_URL}historical_recipes.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const rawData: HistoricalRecipesData = await response.json();
        const processedList: ProcessedRecipe[] = [];
        if (rawData.crafting) {
            for (const id in rawData.crafting) {
                const versions = rawData.crafting[id];
                const latest = Object.keys(versions).sort().pop();
                if (latest) {
                    const recipe = versions[latest];
                    let area = recipe.systemType === 'SandBox' ? 'Simulation Room' : (recipe.systemType || 'All');
                    const processedByproducts: ByproductGroup[] | undefined = recipe.byproductDropId > 0
                        ? [{
                            group: 1,
                            drops: [{
                                itemId: recipe.byproductDropId,
                                min: recipe.dropCountMin,
                                max: recipe.dropCountMax,
                                chance: 100
                            }]
                        }]
                        : undefined;
                    processedList.push({
                        id: `crafting_${recipe.craftRecipeId}`, recipeTypeName: "Crafting",
                        facility: { en: recipe.facilityName_EN, ja: recipe.facilityName_JA },
                        materials: recipe.materials.map((m): ProcessedMaterial => {
                            const baseMaterial = {
                                count: m.amount, durabilityCost: m.reduceDurability, inclusionCost: m.reduceInclusion,
                            };
                            if (m.itemId === 0 && m.itemCategory > 0) return { ...baseMaterial, isCategory: true, id: m.itemCategory, name: { en: m.itemCategoryName_EN || "Category", ja: m.itemCategoryName_JA || "カテゴリ" } };
                            const item = itemMap.get(m.itemId);
                            return { ...baseMaterial, isCategory: false, id: m.itemId, name: { en: item ?.name.en || "Item", ja: item ?.name.ja || "アイテム" } };
                        }),
                        results: [{ itemId: recipe.resultItemId, count: `${recipe.resultAmount}` }],
                        tokenCost: recipe.requiredToken, observationPointCost: recipe.observationPoint,
                        byproducts: processedByproducts,
                        area: area, exp: recipe.exp,
                    });
                }
            }
        }
        if (rawData.smelting) {
            for (const id in rawData.smelting) {
                const versions = rawData.smelting[id];
                const latest = Object.keys(versions).sort().pop();
                if (latest) {
                    const recipe = versions[latest];
                    const materialItem = itemMap.get(recipe.materialItemId);
                    const byproductGroups = new Map<number, { totalWeight: number, drops: any[] }>();
                    if (recipe.byproductInfo) {
                        recipe.byproductInfo.forEach(drop => {
                            if (!byproductGroups.has(drop.dropGroup)) byproductGroups.set(drop.dropGroup, { totalWeight: 0, drops: [] });
                            const group = byproductGroups.get(drop.dropGroup)!;
                            group.totalWeight += drop.weight;
                            group.drops.push(drop);
                        });
                    }
                    const processedByproducts: ByproductGroup[] = Array.from(byproductGroups.entries()).map(([groupNum, data]) => ({
                        group: groupNum,
                        drops: data.drops.map(d => ({
                            itemId: d.itemId,
                            min: d.dropMinAmount,
                            max: d.dropMaxAmount,
                            chance: (d.weight / data.totalWeight) * 100
                        }))
                    }));
                    processedList.push({
                        id: `smelting_${recipe.smeltingCraftRecipeId}`, recipeTypeName: "Processing",
                        facility: { en: recipe.facilityName_EN, ja: recipe.facilityName_JA },
                        materials: [{ isCategory: false, id: recipe.materialItemId, name: { en: materialItem ?.name.en || "Item", ja: materialItem ?.name.ja || "アイテム" }, count: recipe.materialAmount, inclusionCost: 0, durabilityCost: 0 }],
                        results: [{ itemId: recipe.resultItemId, count: `${recipe.resultAmount}` }],
                        area: "All",
                        craftTime: recipe.craftTime,
                        byproducts: processedByproducts,
                    });
                }
            }
        }
        recipesCache = processedList;
        return processedList;
    } catch (error) { console.error("Failed to process recipe data:", error); return []; }
};

let dropSourcesCache: ProcessedDropSource[] | null = null;
const processDropList = (dropList: RawDrop[]): ByproductGroup[] => {
    const groups = new Map<number, { totalWeight: number, drops: RawDrop[] }>();
    dropList.forEach(drop => {
        if (!groups.has(drop.dropGroup)) groups.set(drop.dropGroup, { totalWeight: 0, drops: [] });
        const group = groups.get(drop.dropGroup)!;
        group.totalWeight += drop.weight;
        group.drops.push(drop);
    });
    return Array.from(groups.entries()).map(([groupNum, data]) => ({
        group: groupNum,
        drops: data.drops.map(d => ({
            itemId: d.itemId,
            min: d.dropMinAmount,
            max: d.dropMaxAmount,
            chance: (d.weight / data.totalWeight) * 100
        }))
    }));
};

export const getAllDropSources = async (): Promise<ProcessedDropSource[]> => {
    if (dropSourcesCache) return dropSourcesCache;
    const itemMap = await getItems();
    try {
        const response = await fetch(`${DATA_BASE_URL}historical_droptables.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const rawData: HistoricalDropTablesData = await response.json();
        const processedList: ProcessedDropSource[] = [];
        if (rawData.creature_drops) {
            for (const id in rawData.creature_drops) {
                const versions = rawData.creature_drops[id];
                const latest = Object.keys(versions).sort().pop();
                if (latest) {
                    const source = versions[latest];
                    processedList.push({
                        id: `creature_${source.creatureId}`,
                        sourceTypeName: "Creature",
                        name: { en: source.creatureName_EN, ja: source.creatureName_JA },
                        dropRules: source.drop_rules.map(rule => ({
                            minLevel: rule.creatureMinLevel,
                            maxLevel: rule.creatureMaxLevel,
                            drops: processDropList(rule.resolved_drops),
                        })),
                        observationPoints: source.minObservationPoint === source.maxObservationPoint ? `${source.minObservationPoint}` : `${source.minObservationPoint}-${source.maxObservationPoint}`,
                        exp: source.minExperience === source.maxExperience ? `${source.minExperience}` : `${source.minExperience}-${source.maxExperience}`,
                        creatureId: source.creatureId,
                    });
                }
            }
        }
        const processObjectSource = (sourceData: { [id: string]: { [v: string]: RawObjectSource } } | undefined, typeName: string) => {
            if (!sourceData) return;
            for (const id in sourceData) {
                const versions = sourceData[id];
                const latest = Object.keys(versions).sort().pop();
                if (latest) {
                    const source = versions[latest];
                    const dropList = source.resolved_suitableDropId || source.resolved_drops || [];
                    let foundToolId: number | undefined;
                    if (source.suitableToolCategoryName && source.suitableRank) {
                        for (const item of itemMap.values()) {
                            const toolData = item.extraData.find(d => d.source_file.includes('master_tool')) ?.data;
                            if (toolData && toolData.toolCategoryId === source.suitableToolCategoryName && toolData.itemRank === source.suitableRank) {
                                foundToolId = item.id;
                                break;
                            }
                        }
                    }
                    if (dropList.length > 0) {
                        processedList.push({
                            id: `${typeName.toLowerCase().replace(' ', '_')}_${source.objectId}`,
                            sourceTypeName: typeName,
                            name: { en: source.objectName_EN || source.nameForTool || "?", ja: source.objectName_JA || source.nameForTool || "?" },
                            dropRules: [{
                                minLevel: 1,
                                maxLevel: 100,
                                drops: processDropList(dropList)
                            }],
                            exp: `${source.expertise}`,
                            toolId: foundToolId,
                            canUseUnsuitable: source.canUseUnsuitable === 1,
                            completedDrops: source.completedDropCount,
                            observationPoints: source.observationPoint,
                            spawnInterval: source.spawnInterval,
                            harvests: source.harvestableCountBeforeCompleting,
                        });
                    }
                }
            }
        }
        processObjectSource(rawData.breakable_objects, 'Breakable Object');
        processObjectSource(rawData.harvestable_objects, 'Harvestable');
        processObjectSource(rawData.nest_objects, 'Nest');
        dropSourcesCache = processedList;
        return processedList;
    } catch (error) { console.error("Failed to process drop data:", error); return []; }
};
