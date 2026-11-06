import React, { useState } from 'react';
import { 
  Building2, 
  Coins, 
  Database, 
  ShieldCheck, 
  Trash2, 
  RotateCcw, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { BusinessCategory, BusinessProfile } from '../types';
import { getCategoryLabel } from '../utils/formatters';

interface SettingsViewProps {
  profile: BusinessProfile;
  onUpdateProfile: (profile: BusinessProfile) => void;
  onReloadDemo: () => void;
  onClearAll: () => void;
  transactionsCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onReloadDemo,
  onClearAll,
  transactionsCount
}) => {
  const [name, setName] = useState(profile.name);
  const [category, setCategory] = useState<BusinessCategory>(profile.category);
  const [isSaved, setIsSaved] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || 'Mənim Biznesim',
      category,
      currency: 'AZN'
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Tənzimləmələr
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Biznes profiliniz, valyuta parametrləri və məlumat bazasının idarə edilməsi
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          <span>Biznes məlumatları</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Biznesin və ya mağazanın adı
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Məsələn: Xəzər Market və ya Baku Cafe"
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fəaliyyət sahəsi
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BusinessCategory)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600"
            >
              <option value="retail">Pərakəndə satış (Mağaza, Supermarket)</option>
              <option value="restaurant">Restoran və kafe</option>
              <option value="service">Xidmət sektoru (Gözəllik, Təmir, Təhsil)</option>
              <option value="online">Onlayn satış və elektron ticarət</option>
              <option value="other">Digər fəaliyyət sahələri</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Əsas valyuta
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
              <Coins className="w-4 h-4 text-teal-700" />
              <span>Azərbaycan Manatı (AZN / ₼)</span>
              <span className="text-xs text-slate-400 font-normal ml-auto">Defolt valyuta</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Yadda saxla</span>
            </button>

            {isSaved && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Dəyişikliklər qeydə alındı
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-slate-700" />
          <span>Məlumatların idarə edilməsi</span>
        </h2>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="text-sm font-bold text-slate-900">Mövcud əməliyyatların sayı</div>
            <div className="text-xs text-slate-500 mt-0.5">Sistemdə qeydiyyatda olan bütün gəlir və xərc sətirləri</div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {transactionsCount}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Nümunə məlumatları yüklə</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fiktiv Azərbaycan pərakəndə biznesi üçün 3 aylıq nümunə satış və xərc əməliyyatlarını bərpa edin.
              </p>
            </div>
            <button
              onClick={onReloadDemo}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nümunəni yenilə</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-bold text-rose-900">Bütün məlumatları təmizlə</h3>
              <p className="text-xs text-rose-700 mt-1">
                Yüklənmiş və ya nümunə bütün əməliyyatları bazadan birdəfəlik silir və başlanğıc vəziyyətinə qaytarır.
              </p>
            </div>
            <button
              onClick={() => setConfirmDeleteModal(true)}
              disabled={transactionsCount === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs self-start"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Məlumatları sil</span>
            </button>
          </div>

        </div>
      </div>

      {/* Privacy and Security Policy Note */}
      <div className="bg-slate-100/70 rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">
            Təhlükəsizlik və məxfilik təminatı
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            BiznesPanel biznesinizin məxfiliyinə tam hörmət edir. Şəxsi və kommersiya məlumatlarınız yalnız sizin yerli brauzer yaddaşınızda saxlanılır və xarici bazalara yazılmır. Süni intellekt təhlili zamanı yalnız qruplaşdırılmış ümumi rəqəmlər (şəxsi müştəri detalları olmadan) server vasitəsilə təhlil üçün emal olunur.
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-2 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Məlumatların silinməsi
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bütün qeydə alınmış {transactionsCount} əməliyyat bazadan tamamilə silinəcək. Bu əməliyyatı geri qaytarmaq mümkün deyil. Davam etmək istədiyinizə əminsiniz?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                İmtina
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setConfirmDeleteModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Bəli, tamamilə sil
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
