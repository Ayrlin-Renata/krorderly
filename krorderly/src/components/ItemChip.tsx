import { useState } from 'preact/hooks';
import type { ProcessedItem, ProcessedMaterial } from '../types/GameData';
import { useLocalization } from '../contexts/LocalizationContext';
import { t } from '../utils/Localization';
import { ICON_BASE_URL } from '../Config';

interface ItemChipProps {
  item?: ProcessedItem;
  material?: ProcessedMaterial;
  count: string;
  label?: string;
  onClick: (item: ProcessedItem) => void;
  categoryMap: Map<number, ProcessedItem[]>;
  forceItemDisplay?: boolean;
  chance?: number;
}

const findStat = (item: ProcessedItem, statKey: string): number | undefined => {
    for (const data of item.extraData) {
        if (statKey in data.data) {
            return data.data[statKey];
        }
    }
    return undefined;
};

const formatChance = (chance: number) => {
    return parseFloat(chance.toFixed(6));
};

export function ItemChip({ item, material, count, label, onClick, categoryMap, forceItemDisplay = false, chance }: ItemChipProps) {
  const { language } = useLocalization();
  const [isExpanded, setExpanded] = useState(false);
  const isCategory = !!material?.isCategory && !forceItemDisplay;
  const isClickable = !!item;
  if (!item && !isCategory) {
    return (
      <div class="flex items-center gap-2 bg-gray-900 p-2 rounded-md justify-between h-14">
        <div class="text-sm flex-grow">
          <p class="font-semibold text-gray-400">Nothing</p>
        </div>
        {chance !== undefined && (
          <div class="text-lg font-bold text-cyan-400 pr-2">{formatChance(chance)}%</div>
        )}
      </div>
    );
  }
  let name: string, iconUrl: string;
  let categoryItems: ProcessedItem[] = [];
  if (isCategory) {
    name = language === 'JA' ? material!.name.ja : material!.name.en;
    categoryItems = categoryMap.get(material!.id) || [];
    iconUrl = categoryItems.length > 0 ? `${ICON_BASE_URL}${categoryItems[0].icon}.png` : 'https://placehold.co/40x40/4a5568/ffffff?text=?';
  } else {
    name = item ? (language === 'JA' ? item.name.ja : item.name.en) : 'Unknown';
    iconUrl = item ? `${ICON_BASE_URL}${item.icon}.png` : 'https://placehold.co/40x40/4a5568/ffffff?text=?';
  }
  const handleClick = () => {
    if (isCategory) setExpanded(!isExpanded);
    else if (isClickable) onClick(item!);
  };
  const renderCost = () => {
    if (material?.count && material.count > 0) {
      return <p class="text-gray-400">x {material.count}</p>;
    }
    if (material?.durabilityCost && material.durabilityCost > 0) {
      const total = item ? findStat(item, 'durableValue') : undefined;
      const costText = total ? `${material.durabilityCost} / ${total}` : `${material.durabilityCost}`;
      return <p class="text-gray-400">{t('durabilityCost', language)}: {costText}</p>;
    }
    if (material?.inclusionCost && material.inclusionCost > 0) {
      const total = item ? findStat(item, 'freshness') : undefined;
      const costText = total ? `${material.inclusionCost} / ${total}` : `${material.inclusionCost}`;
      return <p class="text-gray-400">{t('inclusionCost', language)}: {costText}</p>;
    }
    if (!material && count) {
        return <p class="text-gray-400">x {count}</p>;
    }
    return null;
  };
  return (
    <div>
      <div 
        class={`flex items-center gap-2 bg-gray-900 p-2 rounded-md ${isClickable || isCategory ? 'cursor-pointer hover:bg-gray-700 transition-colors' : ''}`}
        onClick={handleClick}
      >
        <img src={iconUrl} alt={name} class="w-10 h-10 object-contain" />
        <div class="text-sm flex-grow">
          {label && <p class="text-xs text-cyan-400">{label}</p>}
          <p class="font-semibold">{name}</p>
          {renderCost()}
        </div>
        {chance !== undefined && (
          <div class="text-lg font-bold text-cyan-400 pr-2">{formatChance(chance)}%</div>
        )}
        {isCategory && (
          <svg xmlns="http://www.w3.org/2000/svg" class={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        )}
      </div>
      {isExpanded && (
        <div class="pl-4 pt-2 space-y-2 border-l-2 border-gray-700 ml-4">
          {categoryItems.map(subItem => (
            <ItemChip 
              key={subItem.id} 
              item={subItem} 
              material={material}
              count={"1"}
              onClick={onClick}
              categoryMap={categoryMap}
              forceItemDisplay={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
