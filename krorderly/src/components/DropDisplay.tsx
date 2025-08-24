import { useState, useMemo } from 'preact/hooks';
import type { ProcessedItem, ByproductGroup } from '../types/GameData';
import { ItemChip } from './ItemChip';
import { ICON_BASE_URL } from '../Config';

interface DropDisplayProps {
  dropGroups: ByproductGroup[];
  itemMap: Map<number, ProcessedItem>;
  categoryMap: Map<number, ProcessedItem[]>;
  onItemClick: (item: ProcessedItem) => void;
  label: string;
}

export function DropDisplay({ dropGroups, itemMap, categoryMap, onItemClick, label }: DropDisplayProps) {
    const [isExpanded, setExpanded] = useState(false);
    const uniqueIcons = useMemo(() => {
        const icons = new Set<string>();
        dropGroups.forEach(group => {
            group.drops.forEach(drop => {
                if (drop.itemId > 0) {
                    const item = itemMap.get(drop.itemId);
                    if (item) icons.add(item.icon);
                }
            });
        });
        return Array.from(icons);
    }, [dropGroups, itemMap]);
    if (!dropGroups || dropGroups.length === 0) return null;
    return (
        <div class="pt-3 border-t border-gray-600">
            <div class="flex justify-between items-center" onClick={() => setExpanded(!isExpanded)}>
                <div class="flex justify-between gap-2">
                    <div class="text-sm bg-gray-800 font-semibold px-3 py-1 rounded-md flex items-center gap-2">
                        <span>{label}</span>
                    </div>
                    {!isExpanded && (
                        <div class="flex items-center min-w-32 flex-wrap">
                            {uniqueIcons.map(icon => (
                                <img key={icon} src={`${ICON_BASE_URL}${icon}.png`} class="w-8 h-8 -ml-3 border-2 border-gray-700 rounded-full bg-gray-800" />
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
                    {dropGroups.map(group => (
                        <div key={group.group} class="pl-2 border-l-2 border-gray-600 space-y-2">
                            {group.drops.sort((a, b) => {return b.chance - a.chance}).map((drop, i) => {
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
