import { useLocalization } from '../contexts/LocalizationContext';
import { t } from '../utils/Localization';export type View = 'itemLookup' | 'listHelper';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: View;
  setView: (view: View) => void;
}

export function Sidebar({ isOpen, onClose, currentView, setView }: SidebarProps) {
  const { language, setLanguage } = useLocalization();
  const linkClasses = "block p-4 text-lg hover:bg-cyan-700 rounded-md";
  const activeLinkClasses = "bg-cyan-600 font-bold";
  const langButtonClasses = "px-4 py-2 rounded-md text-sm font-semibold transition-colors w-full";
  const activeLangButtonClasses = "bg-cyan-600 text-white";
  const inactiveLangButtonClasses = "bg-gray-700 hover:bg-gray-600 text-gray-300";
  const handleLinkClick = (view: View) => {
    setView(view);
    onClose();
  };
  return (
    <div>
      <div 
        class={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside 
        class={`fixed top-0 right-0 h-full w-64 bg-gray-800 shadow-xl z-40 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div class="p-4">
          <div class="mb-6 pb-4 border-b border-gray-700">
            <p class="text-xs text-gray-400 mb-2 uppercase font-semibold">{t('languageTitle', language)}</p>
            <div class="flex items-center space-x-2">
              <button onClick={() => setLanguage('EN')} class={`${langButtonClasses} ${language === 'EN' ? activeLangButtonClasses : inactiveLangButtonClasses}`}>
                English
              </button>
              <button onClick={() => setLanguage('JA')} class={`${langButtonClasses} ${language === 'JA' ? activeLangButtonClasses : inactiveLangButtonClasses}`}>
                日本語
              </button>
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-4">{t('toolsTitle', language)}</h2>
          <nav class="space-y-2">
            <a href="#" onClick={() => handleLinkClick('itemLookup')} class={`${linkClasses} ${currentView === 'itemLookup' ? activeLinkClasses : ''}`}>
              {t('itemLookupTitle', language)}
            </a>
            <a href="#" onClick={() => handleLinkClick('listHelper')} class={`${linkClasses} ${currentView === 'listHelper' ? activeLinkClasses : ''}`}>
              {t('listHelperTitle', language)}
            </a>
          </nav>
        </div>
      </aside>
    </div>
  );
}
