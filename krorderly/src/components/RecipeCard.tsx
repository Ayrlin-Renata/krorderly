import { useState } from 'preact/hooks';
import { useLocalization } from '../contexts/LocalizationContext';
import { t } from '../utils/Localization';
import type { ProcessedItem, ProcessedRecipe } from '../types/GameData';
import { ItemChip } from './ItemChip';

interface RecipeCardProps {
  recipe?: ProcessedRecipe;
  cultivationGroup?: ProcessedRecipe[];
  itemMap: Map<number, ProcessedItem>;
  categoryMap: Map<number, ProcessedItem[]>;
  onItemClick: (item: ProcessedItem) => void;
}

const RecipeDisplay = ({ recipe, itemMap, categoryMap, onItemClick }: Omit<RecipeCardProps, 'cultivationGroup'> & { recipe: ProcessedRecipe }) => {
  const { language } = useLocalization();
  const facilityName = language === 'JA' ? recipe.facility.ja : recipe.facility.en;
  const areaName = recipe.area === 'Simulation Room' ? t('simulationRoom', language) : (recipe.area === 'All' ? t('allAreas', language) : recipe.area);
  const hasCostsOrExp = recipe.byproduct || (recipe.tokenCost || 0) > 0 || (recipe.observationPointCost || 0) > 0 || (recipe.exp || 0) > 0;
  return (
    <div class="space-y-3">
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
      {hasCostsOrExp && (
        <div class="pt-3 border-t border-gray-600 flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-4 items-center">
              {recipe.byproduct && <ItemChip item={itemMap.get(recipe.byproduct.itemId)} count={`${recipe.byproduct.min}-${recipe.byproduct.max}`} label={t('byproduct', language)} onClick={onItemClick} categoryMap={categoryMap} />}
              {(recipe.tokenCost || 0) > 0 && <div class="text-sm bg-gray-900 p-2 rounded-md">{t('tokenCost', language)}: <span class="font-bold">{recipe.tokenCost}</span></div>}
              {(recipe.observationPointCost || 0) > 0 && <div class="text-sm bg-gray-900 p-2 rounded-md">{t('observationPointCost', language)}: <span class="font-bold">{recipe.observationPointCost}</span></div>}
          </div>
          {(recipe.exp || 0) > 0 && <div class="text-sm bg-gray-800 px-3 py-1 rounded-md">{t('exp', language)}: <span class="font-bold">{recipe.exp}</span></div>}
        </div>
      )}
    </div>
  );
}

export function RecipeCard({ recipe, cultivationGroup, itemMap, categoryMap, onItemClick }: RecipeCardProps) {
  const [isExpanded, setExpanded] = useState(false);
  if (cultivationGroup && cultivationGroup.length > 0) {
    const sortedGroup = [...cultivationGroup].sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
    const highestQualityRecipe = sortedGroup[0];
    return (
      <div class="bg-gray-700 p-4 rounded-lg">
        <RecipeDisplay recipe={highestQualityRecipe} itemMap={itemMap} categoryMap={categoryMap} onItemClick={onItemClick} />
        {sortedGroup.length > 1 && (
          <div class="mt-3 pt-3 border-t border-gray-600">
            <button onClick={() => setExpanded(!isExpanded)} class="text-cyan-400 hover:text-cyan-300 text-sm w-full flex justify-center items-center gap-2">
              <span>{isExpanded ? 'Show Less' : `Show ${sortedGroup.length - 1} More Quality Tiers`}</span>
               <svg xmlns="http://www.w3.org/2000/svg" class={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
            {isExpanded && (
              <div class="mt-3 space-y-4">
                {sortedGroup.slice(1).map(rec => (
                   <div class="p-3 bg-gray-800 rounded-md">
                     <RecipeDisplay key={rec.id} recipe={rec} itemMap={itemMap} categoryMap={categoryMap} onItemClick={onItemClick} />
                   </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  if (recipe) {
    return (
      <div class="bg-gray-700 p-4 rounded-lg">
        <RecipeDisplay recipe={recipe} itemMap={itemMap} categoryMap={categoryMap} onItemClick={onItemClick} />
      </div>
    );
  }
  return null;
}
