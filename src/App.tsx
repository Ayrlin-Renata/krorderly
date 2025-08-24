import { useState } from 'preact/hooks';
import { ItemLookupView } from './views/ItemLookupView';
import { Sidebar } from './components/Sidebar';
import type { View } from './components/Sidebar';
import { useLocalization } from './contexts/LocalizationContext';
import { t } from './utils/Localization';

function ListHelperViewPlaceholder() {
  const { language } = useLocalization();
  return (
    <div>
      <h2 class="text-2xl font-semibold mb-4">{t('listHelperTitle', language)}</h2>
      <p class="text-gray-400">This tool is coming soon!</p>
    </div>
  );
}

export function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('itemLookup');
  const { language } = useLocalization();
  const renderCurrentView = () => {
    switch (currentView) {
      case 'itemLookup':
        return <ItemLookupView />;
      case 'listHelper':
        return <ListHelperViewPlaceholder />;
      default:
        return <ItemLookupView />;
    }
  };
  return (
    <div class="bg-gray-900 text-white min-h-screen font-sans">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        setView={setCurrentView}
      />
      <header class="bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 class="text-xl font-bold">{t('appName', language)}</h1>
        <h2 class="text-xl">DEV PREVIEW</h2>
        <button class="p-2 rounded-md hover:bg-gray-700" onClick={() => setSidebarOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>
      <main class="p-4 md:p-6">
        {renderCurrentView()}
      </main>
    </div>
  );
}
