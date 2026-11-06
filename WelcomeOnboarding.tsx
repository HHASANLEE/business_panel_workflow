import React from 'react';
import { 
  Store, 
  Utensils, 
  Briefcase, 
  ShoppingCart, 
  Layers, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { BusinessCategory } from '../types';

interface WelcomeOnboardingProps {
  selectedCategory: BusinessCategory;
  onSelectCategory: (cat: BusinessCategory) => void;
  onLoadDemoData: () => void;
  onStartUpload: () => void;
}

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  selectedCategory,
  onSelectCategory,
  onLoadDemoData,
  onStartUpload
}) => {
  const categories: { id: BusinessCategory; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'retail', label: 'Pərakəndə satış', icon: Store, desc: 'Market, geyim, tikinti və digər mağazalar' },
    { id: 'restaurant', label: 'Restoran və kafe', icon: Utensils, desc: 'Restoranlar, kafelər, fast-food və çatdırılma' },
    { id: 'service', label: 'Xidmət sektoru', icon: Briefcase, desc: 'Təmir, gözəllik, təhsil, konsaltinq və s.' },
    { id: 'online', label: 'Onlayn satış', icon: ShoppingCart, desc: 'Elektron ticarət, Instagram və veb mağazalar' },
    { id: 'other', label: 'Digər fəaliyyət', icon: Layers, desc: 'İstehsal, topdansatış və digər bizneslər' }
  ];

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm mb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Azərbaycan sahibkarları üçün ağıllı idarəetmə paneli</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
            Biznesinizi daha yaxşı tanıyın, daha düzgün qərarlar verin.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
            Biznes məlumatlarınızı bir yerə toplayın, nəticələrinizi izləyin və inkişaf imkanlarını kəşf edin. Mürəkkəb cədvəllər yerinə aydın qrafiklər və süni intellekt təhlili əldə edin.
          </p>

          {/* Business Category Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Fəaliyyət sahənizi seçin:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 leading-snug">
                        {cat.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={onLoadDemoData}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nümunə məlumatlarla yoxla</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartUpload}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <UploadCloud className="w-4 h-4 text-slate-600" />
              <span>Öz məlumatlarımı yüklə</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3-Step Simple Progress Guide */}
      <div className="mb-12">
        <h2 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Necə işləyir?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 relative">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Məlumatlarınızı yükləyin
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mövcud Excel (.xlsx, .xls) və ya CSV faylınızı seçin. Sütunlar avtomatik tanınır və sizə təqdim olunur.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 relative">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Göstəriciləri yoxlayın
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ümumi satışlar, xərclər, əməliyyat nəticəsi və kateqoriya qrafikləri dərhal hesablanır.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 relative">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Biznesinizi analiz edin
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Süni intellekt köməkçisindən məsləhət alın, gəlirli məhsullarınızı və xərc qənaət imkanlarını müəyyənləşdirin.
            </p>
          </div>

        </div>
      </div>

      {/* Trust & Simplicity Note */}
      <div className="bg-slate-100/80 rounded-xl p-5 border border-slate-200 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900">Məxfilik zəmanəti:</span> Sizin kommersiya məlumatlarınız üçüncü tərəflərə ötürülmür. Hesablamalar birbaşa sizin brauzerinizdə yerinə yetirilir. İstənilən vaxt məlumatlarınızı təmizləyə və ya dəyişə bilərsiniz.
        </div>
      </div>

    </div>
  );
};
