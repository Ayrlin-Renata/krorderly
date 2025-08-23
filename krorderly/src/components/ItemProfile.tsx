import { useState, useEffect } from 'preact/hooks';
import type { ProcessedItem, ProcessedRecipe, ProcessedDropSource } from '../types/GameData';
import { useLocalization } from '../contexts/LocalizationContext';
import { t } from '../utils/Localization';
import { getAllRecipes, getAllDropSources, getItems, getItemsByCategory } from '../services/DataService';
import { RecipeCard } from './RecipeCard';
import { DropSourceCard } from './DropSourceCard';
import { ExtraDataDisplay } from './ExtraDataDisplay';
import { ICON_BASE_URL } from '../Config';

interface ItemProfileProps {
  item: ProcessedItem;
  onClose: () => void;
  onItemClick: (item: ProcessedItem) => void;
}

export function ItemProfile({ item, onClose, onItemClick }: ItemProfileProps) {
  const { language } = useLocalization();
  const [recipes, setRecipes] = useState<ProcessedRecipe[]>([]);
  const [dropSources, setDropSources] = useState<ProcessedDropSource[]>([]);
  const [itemMap, setItemMap] = useState<Map<number, ProcessedItem>>(new Map());
  const [categoryMap, setCategoryMap] = useState<Map<number, ProcessedItem[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [allItems, allRecipes, allDropSources, allCategories] = await Promise.all([
        getItems(), getAllRecipes(), getAllDropSources(), getItemsByCategory()
      ]);
      setRecipes(allRecipes.filter(r => r.results.some(res => res.itemId === item.id)));
      setDropSources(allDropSources.filter(s => s.drops.some(d => d.itemId === item.id)));
      setItemMap(allItems);
      setCategoryMap(allCategories);
      setIsLoading(false);
    };
    fetchData();
  }, [item.id]);
  const name = language === 'JA' ? item.name.ja : item.name.en;
  const description = language === 'JA' ? item.description.ja : item.description.en;
  const categoryName = language === 'JA' ? item.category.ja : item.category.en;
  const iconUrl = `${ICON_BASE_URL}${item.icon}.png`;
  return (
    <div class="bg-gray-800 rounded-lg shadow-xl p-6 relative space-y-6">
      <button onClick={onClose} class="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl font-bold leading-none">&times;</button>
      <div class="flex flex-col md:flex-row gap-6 pb-4 border-b border-gray-700">
        <div class="flex-shrink-0 text-center">
          <img src={iconUrl} alt={name} class="w-24 h-24 mx-auto bg-gray-700 rounded-md p-2 object-contain" />
          <p class="mt-2 text-xl font-bold">{name}</p>
          <p class="text-sm text-gray-400">{categoryName}</p>
        </div>
        <div class="flex-grow pt-2"><p class="text-gray-300">{description}</p></div>
      </div>
      {isLoading ? (<p>Loading details...</p>) : (
        <div class="space-y-6">
          {item.extraData.length > 0 && <ExtraDataDisplay extraData={item.extraData} />}
          {recipes.length > 0 && (
            <div>
              <h3 class="text-lg font-semibold mb-3 text-cyan-300">{t('obtainedViaCrafting', language)}</h3>
              <div class="space-y-4">{recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} itemMap={itemMap} categoryMap={categoryMap} onItemClick={onItemClick} />)}</div>
            </div>
          )}
          {dropSources.length > 0 && (
            <div>
              <h3 class="text-lg font-semibold mb-3 text-cyan-300">{t('obtainedFromSources', language)}</h3>
              <div class="space-y-4">{dropSources.map(source => <DropSourceCard key={source.id} source={source} itemMap={itemMap} categoryMap={categoryMap} onItemClick={onItemClick} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
