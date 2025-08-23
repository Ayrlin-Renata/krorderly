import type { ProcessedItem } from '../types/GameData';
import { ICON_BASE_URL } from '../Config';

interface ItemCardProps {
  item: ProcessedItem;
  language: 'EN' | 'JA';
  onClick: () => void;
}

export function ItemCard({ item, language, onClick }: ItemCardProps) {
  const iconUrl = `${ICON_BASE_URL}${item.icon}.png`;
  const name = language === 'JA' ? item.name.ja : item.name.en;
  const category = language === 'JA' ? item.category.ja : item.category.en;
  return (
    <div 
      onClick={onClick}
      class="bg-gray-800 p-3 rounded-lg shadow-md text-center cursor-pointer hover:bg-gray-700 transition-colors flex flex-col items-center justify-between h-full"
    >
      <img 
        src={iconUrl} 
        alt={name} 
        class="w-16 h-16 object-contain mb-2"
        onError={(e) => (e.currentTarget.style.display = 'none')} 
      />
      <div>
        <p class="text-sm font-semibold truncate w-full">{name}</p>
        <p class="text-xs text-gray-400 truncate w-full">{category}</p>
      </div>
    </div>
  );
}
