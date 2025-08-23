import { useLocalization } from '../contexts/LocalizationContext';
import { t } from '../utils/Localization';
import type { ProcessedItem, ProcessedRecipe } from '../types/GameData';
import { ItemChip } from './ItemChip';

interface RecipeCardProps {
  recipe: ProcessedRecipe;
  itemMap: Map<number, ProcessedItem>;
  categoryMap: Map<number, ProcessedItem[]>;
  onItemClick: (item: ProcessedItem) => void;
}

export function RecipeCard({ recipe, itemMap, categoryMap, onItemClick }: RecipeCardProps) {
  const { language } = useLocalization();
  const facilityName = language === 'JA' ? recipe.facility.ja : recipe.facility.en;
  const areaName = recipe.area === 'Simulation Room' ? t('simulationRoom', language) : (recipe.area === 'All' ? t('allAreas', language) : recipe.area);
  return (
    <div class="bg-gray-700 p-4 rounded-lg space-y-3">
      <div class="flex justify-between items-center text-sm">
        <p class="text-cyan-400">Via: {recipe.recipeTypeName} at {facilityName}</p>
        <div class="flex items-center gap-2">
          {recipe.qualityScore !== undefined && (
            <p class="text-gray-300 font-semibold bg-gray-800 px-2 py-1 rounded">{t('qualityScore', language)}: {recipe.qualityScore}</p>
          )}
          <p class="text-gray-300 font-semibold bg-gray-800 px-2 py-1 rounded">{t('area', language)}: {areaName}</p>
        </div>
      </div>
      
      <div class="flex items-center justify-center gap-4">
        <div class="flex flex-col gap-2 w-2/5">
          {recipe.materials.length > 0 
            ? recipe.materials.map((mat, i) => <ItemChip key={`${mat.id}-${i}`} item={!mat.isCategory ? itemMap.get(mat.id) : undefined} material={mat} count={`${mat.count}`} onClick={onItemClick} categoryMap={categoryMap} />)
            : <p class="text-sm text-center text-gray-400">No materials required</p>
          }
        </div>
        <div class="text-2xl font-bold text-gray-400">→</div>
        <div class="flex flex-col gap-2 w-2/5">
          {recipe.results.map((res, i) => <ItemChip key={`${res.itemId}-${i}`} item={itemMap.get(res.itemId)} count={res.count} onClick={onItemClick} categoryMap={categoryMap} />)}
        </div>
      </div>
      {(recipe.byproduct || (recipe.tokenCost || 0) > 0 || (recipe.observationPointCost || 0) > 0) && (
        <div class="pt-3 border-t border-gray-600 flex flex-wrap gap-4 items-center">
          {recipe.byproduct && (
            <ItemChip 
              item={itemMap.get(recipe.byproduct.itemId)} 
              count={`${recipe.byproduct.min}-${recipe.byproduct.max}`} 
              label={t('byproduct', language)}
              onClick={onItemClick}
              categoryMap={categoryMap}
            />
          )}
          {(recipe.tokenCost || 0) > 0 && <div class="text-sm bg-gray-900 p-2 rounded-md">{t('tokenCost', language)}: <span class="font-bold">{recipe.tokenCost}</span></div>}
          {(recipe.observationPointCost || 0) > 0 && <div class="text-sm bg-gray-900 p-2 rounded-md">{t('observationPointCost', language)}: <span class="font-bold">{recipe.observationPointCost}</span></div>}
        </div>
      )}
    </div>
  );
}
