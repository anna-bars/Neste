import { Cpu, FileText, LineChart } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: 'overview' | 'documents' | 'analytics';
  onTabChange: (tab: 'overview' | 'documents' | 'analytics') => void;
  documentsCount: number;
  showAnalytics: boolean;
}

export default function NavigationTabs({
  activeTab,
  onTabChange,
  documentsCount,
  showAnalytics,
}: NavigationTabsProps) {
  return (
    <div className="bg-white/80 rounded-2xl border border-gray-200 p-1">
      <div className="flex space-x-1">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 border border-blue-300'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Cpu className="w-4 h-4" />
            Overview
          </div>
        </button>
        <button
          onClick={() => onTabChange('documents')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
            activeTab === 'documents'
              ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 border border-blue-300'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Documents ({documentsCount})
          </div>
        </button>
        {showAnalytics && (
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 border border-blue-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <LineChart className="w-4 h-4" />
              Analytics
            </div>
          </button>
        )}
      </div>
    </div>
  );
}