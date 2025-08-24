export interface HistoricalItemsData { items: { [id: string]: { [v: string]: ItemVersion } } }
export interface ItemVersion {
    itemId: number; sortId: number; categoryId: number; iconResourceName: string;
    modelResourceName: string; itemName_EN: string; itemName_JA: string;
    itemDescription_EN: string; itemDescription_JA: string; category: Category;
    extra_data: ExtraData[];
}

export interface Category {
    itemCategoryId: number; sortId: number; nameKey: string; belongMainCategory: number;
    belongSubCateory: number; hideFilter: number; iconResourceName: string;
    name_EN: string; name_JA: string;
}

export interface ExtraData { source_file: string; data: Record<string, any>; }
export interface ProcessedItem {
    id: number; name: { en: string; ja: string; }; description: { en: string; ja: string; };
    icon: string; category: { id: number; en: string; ja: string; }; extraData: ExtraData[];
}

export interface ProcessedMaterial {
    isCategory: boolean; id: number; name: { en: string; ja: string; };
    count: number; durabilityCost: number; inclusionCost: number;
}

export interface ProcessedRecipe {
    id: string; recipeTypeName: string; facility: { en: string, ja: string };
    materials: ProcessedMaterial[]; results: { itemId: number; count: string; }[];
    tokenCost?: number; observationPointCost?: number;
    byproduct?: { itemId: number; min: number; max: number; };
    area: string; qualityScore?: number; exp?: number;
}

export interface ProcessedDropSource {
    id: string; sourceTypeName: string; name: { en: string, ja: string };
    drops: { itemId: number; min: number; max: number; chance: number; }[];
    exp?: string;
}

export interface HistoricalRecipesData {
    crafting?: { [id: string]: { [v: string]: RawCraftingRecipe } };
    smelting?: { [id: string]: { [v: string]: RawSmeltingRecipe } };
    cultivation?: { [id: string]: { [v: string]: RawCultivationRecipe } };
}

export interface RawCraftingMaterial {
    itemId: number; amount: number; itemCategory: number;
    itemCategoryName_EN?: string; itemCategoryName_JA?: string;
    reduceDurability: number; reduceInclusion: number;
}

export interface RawCraftingRecipe {
    craftRecipeId: number; resultItemId: number; resultAmount: number;
    facilityName_EN: string; facilityName_JA: string; materials: RawCraftingMaterial[];
    requiredToken: number; observationPoint: number; byproductDropId: number;
    dropCountMin: number; dropCountMax: number; systemType: string; exp: number;
}

export interface RawSmeltingRecipe {
    smeltingCraftRecipeId: number; materialItemId: number; materialAmount: number;
    resultItemId: number; resultAmount: number; craftTime: number;
    facilityName_EN: string; facilityName_JA: string;
}

export interface RawCultivationRecipe {
    id: string; seedItemId: number;
    resolved_drop_scores: {
        qualityScore: number;
        resolved_lotteries: { dropItemId: number; minDropAmount: number; maxDropAmount: number; }[];
    }[];
}

export interface HistoricalDropTablesData {
    creature_drops?: { [id: string]: { [v: string]: RawCreatureSource } };
    breakable_objects?: { [id: string]: { [v: string]: RawObjectSource } };
    harvestable_objects?: { [id: string]: { [v: string]: RawObjectSource } };
    nest_objects?: { [id: string]: { [v: string]: RawObjectSource } };
}

export interface RawDrop {
    itemId: number; dropMinAmount: number; dropMaxAmount: number; weight: number;
}

export interface RawCreatureSource {
    creatureId: number; creatureName_EN: string; creatureName_JA: string;
    drop_rules: { resolved_drops: RawDrop[]; }[];
    minExperience: number; maxExperience: number;
}

export interface RawObjectSource {
    objectId: number; objectName_EN: string; objectName_JA: string;
    resolved_suitableDropId?: RawDrop[];
    resolved_drops?: RawDrop[];
    expertise: number;
}
