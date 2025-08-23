import { DATA_BASE_URL } from '../Config';
import type {
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
                    processedList.push({
                        id: `crafting_${recipe.craftRecipeId}`, recipeTypeName: "Crafting",
                        facility: { en: recipe.facilityName_EN, ja: recipe.facilityName_JA },
                        materials: recipe.materials.map((m): ProcessedMaterial => {
                            const baseMaterial = {
                                count: m.amount,
                                durabilityCost: m.reduceDurability,
                                inclusionCost: m.reduceInclusion,
                            };
                            if (m.itemId === 0 && m.itemCategory > 0) {
                                return { ...baseMaterial, isCategory: true, id: m.itemCategory, name: { en: m.itemCategoryName_EN || "Category", ja: m.itemCategoryName_JA || "カテゴリ" } };
                            }
                            const item = itemMap.get(m.itemId);
                            return { ...baseMaterial, isCategory: false, id: m.itemId, name: { en: item ?.name.en || "Item", ja: item ?.name.ja || "アイテム" } };
                        }),
                        results: [{ itemId: recipe.resultItemId, count: `${recipe.resultAmount}` }],
                        tokenCost: recipe.requiredToken, observationPointCost: recipe.observationPoint,
                        byproduct: recipe.byproductDropId > 0 ? { itemId: recipe.byproductDropId, min: recipe.dropCountMin, max: recipe.dropCountMax } : undefined,
                        area: area,
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
                    processedList.push({
                        id: `smelting_${recipe.smeltingCraftRecipeId}`, recipeTypeName: "Smelting",
                        facility: { en: recipe.facilityName_EN, ja: recipe.facilityName_JA },
                        materials: [{ isCategory: false, id: recipe.materialItemId, name: { en: materialItem ?.name.en || "Item", ja: materialItem ?.name.ja || "アイテム" }, count: recipe.materialAmount, inclusionCost: 0, durabilityCost: 0 }],
                        results: [{ itemId: recipe.resultItemId, count: `${recipe.resultAmount}` }],
                        area: "All",
                    });
                }
            }
        }
        if (rawData.cultivation) {
            for (const id in rawData.cultivation) {
                const versions = rawData.cultivation[id];
                const latest = Object.keys(versions).sort().pop();
                if (latest) {
                    const recipe = versions[latest];
                    const seedItem = itemMap.get(recipe.seedItemId);
                    recipe.resolved_drop_scores.forEach(score => {
                        processedList.push({
                            id: `cultivation_${recipe.id}_${score.qualityScore}`, recipeTypeName: "Cultivation",
                            facility: { en: "Planter", ja: "プランター" },
                            materials: [{ isCategory: false, id: recipe.seedItemId, name: { en: seedItem ?.name.en || "Seed", ja: seedItem ?.name.ja || "種" }, count: 1, inclusionCost: 0, durabilityCost: 0 }],
                            results: score.resolved_lotteries.map(l => ({ itemId: l.dropItemId, count: `${l.minDropAmount}-${l.maxDropAmount}` })),
                            qualityScore: score.qualityScore,
                            area: "All",
                        });
                    });
                }
            }
        }
        recipesCache = processedList;
        return processedList;
    } catch (error) { console.error("Failed to process recipe data:", error); return []; }
};

let dropSourcesCache: ProcessedDropSource[] | null = null;
const calculateChance = (drop: RawDrop, allDropsInGroup: RawDrop[]): number => {
    const totalWeight = allDropsInGroup.reduce((sum, d) => sum + d.weight, 0);
    if (totalWeight === 0) return 0;
    return (drop.weight / totalWeight) * 100;
};

export const getAllDropSources = async (): Promise<ProcessedDropSource[]> => {
    if (dropSourcesCache) return dropSourcesCache;
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
                    const allDrops: ProcessedDropSource['drops'] = [];
                    source.drop_rules.forEach(rule => {
                        rule.resolved_drops.forEach(drop => {
                            if (drop.itemId === 0) return;
                            allDrops.push({
                                itemId: drop.itemId,
                                min: drop.dropMinAmount,
                                max: drop.dropMaxAmount,
                                chance: calculateChance(drop, rule.resolved_drops),
                            });
                        });
                    });
                    processedList.push({
                        id: `creature_${source.creatureId}`,
                        sourceTypeName: "Creature",
                        name: { en: source.creatureName_EN, ja: source.creatureName_JA },
                        drops: allDrops,
                    });
                }
            }
        }
        const processObjectSource = (
            sourceData: { [id: string]: { [v: string]: RawObjectSource } } | undefined,
            typeName: string
        ) => {
            if (!sourceData) return;
            for (const id in sourceData) {
                const versions = sourceData[id];
                const latest = Object.keys(versions).sort().pop();
                if (latest) {
                    const source = versions[latest];
                    const dropList = source.resolved_suitableDropId || source.resolved_drops || [];
                    if (dropList.length > 0) {
                        processedList.push({
                            id: `${typeName.toLowerCase().replace(' ', '_')}_${source.objectId}`,
                            sourceTypeName: typeName,
                            name: { en: source.objectName_EN, ja: source.objectName_JA },
                            drops: dropList.filter((d: RawDrop) => d.itemId !== 0).map((d: RawDrop) => ({
                                itemId: d.itemId,
                                min: d.dropMinAmount,
                                max: d.dropMaxAmount,
                                chance: calculateChance(d, dropList),
                            })),
                        });
                    }
                }
            }
        }
        processObjectSource(rawData.breakable_objects, 'Breakable Object');
        processObjectSource(rawData.harvestable_objects, 'Harvestable');
        processObjectSource(rawData.nest_objects, 'Nest');
        dropSourcesCache = processedList;
        console.log(`Processed ${processedList.length} drop sources.`);
        return processedList;
    } catch (error) {
        console.error("Failed to process drop data:", error);
        return [];
    }
};
