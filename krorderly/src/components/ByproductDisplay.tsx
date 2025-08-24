import { useState, useMemo } from 'preact/hooks';
import { useLocalization } from '../contexts/LocalizationContext';
import { t } from '../utils/Localization';
import type { ProcessedItem, ByproductGroup } from '../types/GameData';
import { ItemChip } from './ItemChip';
import { ICON_BASE_URL } from '../Config';

interface ByproductDisplayProps {
    byproducts: ByproductGroup[];
    itemMap: Map<number, ProcessedItem>;
    categoryMap: Map<number, ProcessedItem[]>;
    onItemClick: (item: ProcessedItem) => void;
}

export function ByproductDisplay({ byproducts, itemMap, categoryMap, onItemClick }: ByproductDisplayProps) {
    const [isExpanded, setExpanded] = useState(false);
    const { language } = useLocalization();
    const uniqueByproductIcons = useMemo(() => {
        const icons = new Set<string>();
        byproducts.forEach(group => {
            group.drops.forEach(drop => {
                if (drop.itemId > 0) {
                    const item = itemMap.get(drop.itemId);
                    if (item) icons.add(item.icon);
                }
            });
        });
        return Array.from(icons);
    }, [byproducts, itemMap]);
    if (!byproducts || byproducts.length === 0) return null;
    return (
        <div class="pt-3 border-t border-gray-600">
            <div class="flex justify-between items-center" onClick={() => setExpanded(!isExpanded)}>
                <div class="flex justify-between gap-3">
                    <div class="text-sm bg-gray-800 font-semibold px-3 py-1 rounded-md flex items-center gap-2">
                        <span>{t('byproduct', language)}</span>
                    </div>
                    {!isExpanded && (
                        <div class="flex items-center mw-32 flex-wrap">
                            {uniqueByproductIcons.map(icon => (
                                <img key={icon} src={`${ICON_BASE_URL}${icon}.png`} class="w-8 h-8 -ml-4 border-2 border-gray-700 rounded-full bg-gray-800" />
                            ))}
                        </div>
                    )}
                </div>
                <button class="text-cyan-400 hover:text-cyan-300 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
            </div>
            {isExpanded && (
                <div class="mt-2 space-y-3">
                    {byproducts.map(group => (
                        <div key={group.group} class="pl-2 border-l-2 border-gray-600 space-y-2">
                            {group.drops.map((drop, i) => {
                                const item = drop.itemId > 0 ? itemMap.get(drop.itemId) : undefined;
                                const count = drop.min === drop.max ? `${drop.min}` : `${drop.min}-${drop.max}`;
                                return (
                                    <ItemChip
                                        key={`${drop.itemId}-${i}`}
                                        item={item}
                                        count={count}
                                        onClick={onItemClick}
                                        categoryMap={categoryMap}
                                        chance={drop.chance}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
