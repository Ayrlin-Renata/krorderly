import { h } from 'preact';
import { useEffect, useState, useMemo, useRef } from 'preact/hooks';
import { getItems } from '../services/DataService';
import type { ProcessedItem } from '../types/GameData';
import { useLocalization } from '../contexts/LocalizationContext';
import { t } from '../utils/Localization';
import { SearchBar } from '../components/shared/SearchBar';
import { ItemCard } from '../components/ItemCard';
import { ItemProfile } from '../components/ItemProfile';
import { SearchKeywords } from '../components/shared/SearchKeywords';

export function ItemLookupView() {
  const [items, setItems] = useState<Map<number, ProcessedItem>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ProcessedItem | null>(null);
  const { language } = useLocalization();
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    
    const keywordRegex = /(category|id):(?:"([^"]+)"|(\S+))/g;
    const keywordFilters: { [key: string]: string } = {};
    let nameQuery = lowerCaseQuery;
    let match;
    while ((match = keywordRegex.exec(lowerCaseQuery)) !== null) {
      const value = match[2] || match[3];
      if (value) {
        keywordFilters[match[1]] = value;
      }
      nameQuery = nameQuery.replace(match[0], '').trim();
    }
    let results = itemsArray;
    if (keywordFilters.category) {
      const filterValue = keywordFilters.category.replace(/_/g, ' ');
      results = results.filter(item => {
        const category = language === 'JA' ? item.category.ja : item.category.en;
        return typeof category === 'string' && category.toLowerCase().includes(filterValue);
      });
    }
    if (keywordFilters.id) {
      results = results.filter(item => item.id.toString().includes(keywordFilters.id));
    }
    if (nameQuery) {
      const startsWithMatches: ProcessedItem[] = [];
      const includesMatches: ProcessedItem[] = [];
      for (const item of results) {
        const name = language === 'JA' ? item.name.ja : item.name.en;
        if (typeof name === 'string') {
          const lowerCaseName = name.toLowerCase();
          if (lowerCaseName.startsWith(nameQuery)) {
            startsWithMatches.push(item);
          } else if (lowerCaseName.includes(nameQuery)) {
            includesMatches.push(item);
          }
        }
      }
      results = [...startsWithMatches, ...includesMatches];
    }
    
    return results.slice(0, 30);
  }, [items, searchQuery, language]);
  const handleCardSelect = (item: ProcessedItem) => {
    setSelectedItem(item);
  };
  const handleChipSelect = (item: ProcessedItem) => {
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
  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(prev => `${prev} ${keyword}`.trim());
    if (selectedItem) {
      setSelectedItem(null);
    }
    searchInputRef.current?.focus();
  };
  return (
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">{t('itemLookupTitle', language)}</h2>
      
      {isLoading ? (
        <div class="flex justify-center items-center p-8"><p class="text-lg">Loading item data...</p></div>
      ) : (
        <div class="space-y-4">
          <SearchBar 
            ref={searchInputRef}
            value={searchQuery}
            onInput={handleSearchInput}
            placeholder={`Search by name or use a keyword...`}
          />
          <SearchKeywords onKeywordClick={handleKeywordClick} />
          
          {selectedItem && (
             <div class="mt-6">
                <ItemProfile item={selectedItem} onClose={handleProfileClose} onItemClick={handleChipSelect} />
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
                    onClick={() => handleCardSelect(item)}
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
