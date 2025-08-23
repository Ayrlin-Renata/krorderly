import { useLocalization } from '../contexts/LocalizationContext';
import type { ProcessedItem, ProcessedDropSource } from '../types/GameData';
import { ItemChip } from './ItemChip';

interface DropSourceCardProps {
  source: ProcessedDropSource;
  itemMap: Map<number, ProcessedItem>;
  categoryMap: Map<number, ProcessedItem[]>;
  onItemClick: (item: ProcessedItem) => void;
}

export function DropSourceCard({ source, itemMap, categoryMap, onItemClick }: DropSourceCardProps) {
    const { language } = useLocalization();
    const sourceName = language === 'JA' ? source.name.ja : source.name.en;
    return (
        <div class="bg-gray-700 p-4 rounded-lg">
            <p class="text-md font-bold mb-2">{sourceName}</p>
            <p class="text-sm text-cyan-400 mb-3">Source Type: {source.sourceTypeName}</p>
            <div class="space-y-2">
                {source.drops.map((drop, i) => {
                    const item = itemMap.get(drop.itemId);
                    if (!item) return null;
                    const amount = drop.min === drop.max ? `${drop.min}` : `${drop.min}-${drop.max}`;
                    return <ItemChip key={i} item={item} count={amount} onClick={onItemClick} categoryMap={categoryMap} />;
                })}
            </div>
        </div>
    );
}
