import type { ExtraData } from '../types/GameData';
import { useLocalization } from '../contexts/LocalizationContext';
import { t } from '../utils/Localization';

interface ExtraDataDisplayProps {
    extraData: ExtraData[];
}

function Stat({ labelKey, value }: { labelKey: string, value: any }) {
    const { language } = useLocalization();
    if (value === null || value === undefined || value === 0) {
        return null;
    }
    return (
        <div class="flex justify-between text-sm">
            <span class="text-gray-400">{t(labelKey as any, language)}</span>
            <span class="font-semibold">{value}</span>
        </div>
    );
}

interface CombinedData {
    [key: string]: any;
}

export function ExtraDataDisplay({ extraData }: ExtraDataDisplayProps) {
    const allData = extraData.reduce<CombinedData>((acc, current) => {
        return { ...acc, ...current.data };
    }, {});
    const sourceFiles = extraData.map(d => d.source_file);
    const generalStats = (
        <>
            <Stat labelKey="weight" value={allData.weight} />
            <Stat labelKey="stackSize" value={allData.stack} />
            <Stat labelKey="durability" value={allData.durableValue} />
        </>
    );
    const specificStats = sourceFiles.map(sourceFile => {
        if (sourceFile.includes('master_food')) {
            return (
                <>
                    <Stat labelKey="foodPoints" value={allData.foodPoint} />
                    <Stat labelKey="waterPoints" value={allData.waterPoint} />
                    <Stat labelKey="cooldown" value={allData.coolDown} />
                    <Stat labelKey="freshness" value={allData.freshness} />
                </>
            );
        }
        if (sourceFile.includes('master_armor') || sourceFile.includes('master_accessory')) {
            return (
                <>
                    <Stat labelKey="defense" value={allData.defense || allData.defensePower} />
                    <Stat labelKey="magicDefense" value={allData.magicDefense} />
                </>
            );
        }
        if (sourceFile.includes('master_weapon')) {
            return <Stat labelKey="attackPower" value={allData.attackPower} />;
        }
        if (sourceFile.includes('master_tool')) {
            return (
                <>
                    <Stat labelKey="breaking" value={allData.breaking} />
                    <Stat labelKey="toolCategory" value={allData.toolCategoryId} />
                    <Stat labelKey="itemRank" value={allData.itemRank} />
                </>
            );
        }
        if (sourceFile.includes('master_trap')) {
            return <Stat labelKey="hp" value={allData.hp} />;
        }
        if (sourceFile.includes('master_smelting_fuel')) {
            return <Stat labelKey="fuelDuration" value={allData.duration} />;
        }
        if (sourceFile.includes('master_cultivation_fertilizer')) {
            return <Stat labelKey="fertilizerValue" value={allData.effectVal} />;
        }
        return null;
    });
    const hasStats = extraData.length > 0;
    if (!hasStats) {
        return null;
    }
    return (
        <div>
            <h3 class="text-lg font-semibold mb-3 text-cyan-300">{t('additionalDetails', useLocalization().language)}</h3>
            <div class="bg-gray-700 p-4 rounded-lg space-y-2">
                {generalStats}
                {specificStats}
            </div>
        </div>
    );
}
