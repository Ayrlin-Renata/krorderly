import { h } from 'preact';
import { useEffect, useState, useMemo } from 'preact/hooks';
import { getItems } from '../services/DataService';
import type { ProcessedItem } from '../types/GameData';
import { useLocalization } from '../contexts/LocalizationContext';
import { t } from '../utils/Localization';
import { SearchBar } from '../components/shared/SearchBar';
import { ItemCard } from '../components/ItemCard';
import { ItemProfile } from '../components/ItemProfile';

export function ItemLookupView() {
  const [items, setItems] = useState<Map<number, ProcessedItem>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ProcessedItem | null>(null);
  const { language } = useLocalization();
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const fetchedItems = await getItems();
      setItems(fetchedItems);
      setIsLoading(false);
    };
    fetchItems();
  }, []);
  const filteredItems = useMemo(() => {
    if (!searchQuery) return [];
    const itemsArray = Array.from(items.values());
    const lowerCaseQuery = searchQuery.toLowerCase();
    const results = itemsArray.filter(item => {
      const name = language === 'JA' ? item.name.ja : item.name.en;
      return typeof name === 'string' && name.toLowerCase().includes(lowerCaseQuery);
    });
    return results.slice(0, 30);
  }, [items, searchQuery, language]);
  const handleItemSelect = (item: ProcessedItem) => {
    setSelectedItem(item);
    
    const name = language === 'JA' ? item.name.ja : item.name.en;
    setSearchQuery(name);
  };
  
  const handleProfileClose = () => {
    setSelectedItem(null);
  };
  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    if (selectedItem) {
      setSelectedItem(null);
    }
  };
  return (
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">{t('itemLookupTitle', language)}</h2>
      
      {isLoading ? (
        <div class="flex justify-center items-center p-8"><p class="text-lg">Loading item data...</p></div>
      ) : (
        <div class="space-y-4">
          <SearchBar 
            value={searchQuery}
            onInput={handleSearchInput}
            placeholder={`Search for an item in ${language}...`}
          />
          
          {selectedItem && (
             <div class="mt-6">
                <ItemProfile item={selectedItem} onClose={handleProfileClose} onItemClick={handleItemSelect} />
             </div>
          )}
          {!selectedItem && (
            <>
              {!searchQuery && (
                <p class="text-center text-gray-400 pt-4">Start typing above to find an item.</p>
              )}
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredItems.map(item => (
                  <ItemCard 
                    key={item.id}
                    item={item}
                    language={language}
                    onClick={() => handleItemSelect(item)}
                  />
                ))}
              </div>
              {filteredItems.length === 0 && searchQuery && (
                <p class="text-center text-gray-400">No items found.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
