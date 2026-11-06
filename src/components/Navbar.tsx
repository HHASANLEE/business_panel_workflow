import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  TrendingUp, 
  Bot, 
  FileText, 
  Settings, 
  Menu, 
  X,
  Database
} from 'lucide-react';
import { DataSource } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  dataSource: DataSource | null;
  totalTransactionsCount: number;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  dataSource,
  totalTransactionsCount,
  onOpenUpload
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'İdarəetmə paneli', icon: LayoutDashboard },
    { id: 'import', label: 'Məlumat yüklə', icon: Upload },
    { id: 'analysis', label: 'Biznes təhlili', icon: TrendingUp },
    { id: 'ai', label: 'Biznes köməkçisi', icon: Bot },
    { id: 'reports', label: 'Hesabatlar', icon: FileText },
    { id: 'settings', label: 'Tənzimləmələr', icon: Settings }
  ];

  const handleTabClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="text-left flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-lg shadow-sm">
                BP
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  BiznesPanel
                </span>
                {dataSource && (
                  <span className="block text-[11px] text-slate-500 font-medium">
                    {dataSource === 'demo' ? 'Nümunə rejim' : 'Şəxsi məlumatlar'}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single line prose) */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors py-1 ${
                    isActive
                      ? 'text-teal-700 border-b-2 border-teal-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action / Quick Stat */}
          <div className="flex items-center gap-3 shrink-0">
            {totalTransactionsCount > 0 ? (
              <button
                onClick={onOpenUpload}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Məlumat əlavə et</span>
              </button>
            ) : (
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Fayl yüklə</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onOpenUpload();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Məlumat yüklə</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
