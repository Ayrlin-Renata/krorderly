import { useState, useEffect, useMemo } from 'preact/hooks';
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

const SectionHeader = ({ title, isOpen, onToggle }: { title: string, isOpen: boolean, onToggle: () => void }) => (
  <button onClick={onToggle} class="w-full flex justify-between items-center text-left">
    <h3 class="text-xl font-bold text-white">{title}</h3>
    <svg xmlns="http://www.w3.org/2000/svg" class={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </button>
);
export function ItemProfile({ item, onClose, onItemClick }: ItemProfileProps) {
  const { language } = useLocalization();
  const [recipes, setRecipes] = useState<ProcessedRecipe[]>([]);
  const [dropSources, setDropSources] = useState<ProcessedDropSource[]>([]);
  const [itemMap, setItemMap] = useState<Map<number, ProcessedItem>>(new Map());
  const [categoryMap, setCategoryMap] = useState<Map<number, ProcessedItem[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(true);
  const [isCollectOpen, setCollectOpen] = useState(true);
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
  const groupedCultivationRecipes = useMemo(() => {
    const groups = new Map<number, ProcessedRecipe[]>();
    const otherRecipes: ProcessedRecipe[] = [];
    recipes.forEach(recipe => {
      if (recipe.recipeTypeName === 'Cultivation' && recipe.materials[0]) {
        const seedId = recipe.materials[0].id;
        if (!groups.has(seedId)) groups.set(seedId, []);
        groups.get(seedId)!.push(recipe);
      } else {
        otherRecipes.push(recipe);
      }
    });
    return { groups, otherRecipes };
  }, [recipes]);
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
              <SectionHeader title={t('create', language)} isOpen={isCreateOpen} onToggle={() => setCreateOpen(!isCreateOpen)} />
              {isCreateOpen && (
                <div class="mt-3 space-y-4">
                  {groupedCultivationRecipes.otherRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} itemMap={itemMap} categoryMap={categoryMap} onItemClick={onItemClick} />)}
                  {Array.from(groupedCultivationRecipes.groups.values()).map(group => <RecipeCard key={group[0].id} cultivationGroup={group} itemMap={itemMap} categoryMap={categoryMap} onItemClick={onItemClick} />)}
                </div>
              )}
            </div>
          )}
          {dropSources.length > 0 && (
            <div>
              <SectionHeader title={t('collect', language)} isOpen={isCollectOpen} onToggle={() => setCollectOpen(!isCollectOpen)} />
              {isCollectOpen && (
                <div class="mt-3 space-y-4">{dropSources.map(source => <DropSourceCard key={source.id} source={source} itemMap={itemMap} categoryMap={categoryMap} onItemClick={onItemClick} />)}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
