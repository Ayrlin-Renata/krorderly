import { useState } from 'preact/hooks';

interface SearchKeywordsProps {
    onKeywordClick: (keyword: string) => void;
}

const keywords = ['category:'];
export function SearchKeywords({ onKeywordClick }: SearchKeywordsProps) {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const handleKeywordSelect = (keyword: string) => {
        onKeywordClick(keyword);
        setDropdownOpen(false);
    };
    const KeywordButtons = () => (
        <>
            {keywords.map(kw => (
                <button
                    key={kw}
                    onClick={() => onKeywordClick(kw)}
                    class="px-3 py-1 bg-gray-600 hover:bg-cyan-600 rounded-md text-sm transition-colors"
                >
                    {kw.replace(':', '')}
                </button>
            ))}
        </>
    );
    return (
        <div>
            <div class="md:hidden relative">
                <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    class="w-full text-left px-3 py-2 bg-gray-700 rounded-md flex justify-between items-center"
                >
                    <span>Search by Keyword...</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
                {isDropdownOpen && (
                    <div class="absolute top-full left-0 w-full bg-gray-600 rounded-md mt-1 z-10 shadow-lg">
                        {keywords.map(kw => (
                            <a
                                key={kw}
                                href="#"
                                onClick={() => handleKeywordSelect(kw)}
                                class="block px-4 py-2 hover:bg-cyan-600"
                            >
                                {kw.replace(':', '')}
                            </a>
                        ))}
                    </div>
                )}
            </div>
            <div class="hidden md:flex items-center gap-2">
                <span class="text-sm text-gray-400">Search by:</span>
                <KeywordButtons />
            </div>
        </div>
    );
}
