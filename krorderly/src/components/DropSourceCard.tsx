import { useLocalization } from '../contexts/LocalizationContext';
import type { ProcessedItem, ProcessedDropSource } from '../types/GameData';
import { ItemChip } from './ItemChip';
import { t } from '../utils/Localization';

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
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="text-md font-bold">{sourceName}</p>
                    <p class="text-sm text-cyan-400 mb-1">Source Type: {source.sourceTypeName}</p>
                </div>
                {source.exp && (
                    <div class="text-sm bg-gray-800 px-3 py-1 rounded-md">{t('exp', language)}: <span class="font-bold">{source.exp}</span></div>
                )}
            </div>
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
