import { useLocalization } from '../contexts/LocalizationContext';
import type { ProcessedItem, ProcessedDropSource } from '../types/GameData';
import { t } from '../utils/Localization';
import { DropDisplay } from './DropDisplay';
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
    const requiredTool = source.toolId ? itemMap.get(source.toolId) : undefined;
    const isHarvestable = source.sourceTypeName === 'Harvestable';
    return (
        <div class="bg-gray-700 p-4 rounded-lg space-y-2">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-md font-bold">{sourceName}</p>
                    <p class="text-sm text-cyan-400 mb-1">Source Type: {source.sourceTypeName}</p>
                    {source.creatureId && <p class="text-xs text-gray-400">ID: {source.creatureId}</p>}
                </div>
                <div class="flex items-center gap-2 text-sm">
                    {source.observationPoints !== undefined && <div class="bg-gray-800 px-3 py-1 rounded-md">{t('observationPoints', language)}: <span class="font-bold">{source.observationPoints}</span></div>}
                    {source.exp && <div class="bg-gray-800 px-3 py-1 rounded-md">{t('exp', language)}: <span class="font-bold">{source.exp}</span></div>}
                </div>
            </div>
            <div class="flex flex-wrap gap-4 items-end text-sm">
                {requiredTool && (
                    <div class="flex items-center gap-2">
                        <ItemChip item={requiredTool} count={source.canUseUnsuitable ? "Optional" : "Required"} onClick={onItemClick} categoryMap={categoryMap} />
                    </div>
                )}
                {source.canUseUnsuitable !== undefined && <div class="bg-gray-800 px-3 py-1 rounded-md">{t('toolRequirement', language)}: <span class="font-bold">{source.canUseUnsuitable ? "No" : "Yes"}</span></div>}
                {source.completedDrops !== undefined && <div class="bg-gray-800 px-3 py-1 rounded-md">{t('completedDrops', language)}: <span class="font-bold">{source.completedDrops}</span></div>}
                {isHarvestable && source.spawnInterval !== undefined && <div class="bg-gray-800 px-3 py-1 rounded-md">{t('spawnInterval', language)}: <span class="font-bold">{source.spawnInterval}s</span></div>}
                
            </div>
            {source.dropRules.map(rule => (
                <DropDisplay 
                    key={`${rule.minLevel}-${rule.maxLevel}`}
                    label={isHarvestable ? t('harvestableDrops', language) : `${t('levelRange', language)} ${rule.minLevel}-${rule.maxLevel}`} 
                    dropGroups={rule.drops} 
                    itemMap={itemMap} 
                    categoryMap={categoryMap} 
                    onItemClick={onItemClick} 
                />
            ))}
        </div>
    );
}
