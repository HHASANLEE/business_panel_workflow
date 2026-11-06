import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Target, 
  Layers, 
  Store, 
  Users, 
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PeriodFilter, Transaction } from '../types';
import { 
  getDateRangeForPeriod, 
  filterTransactionsByDate, 
  calculateKPIs, 
  getCategoryBreakdown, 
  getTopProducts, 
  getTimelineData, 
  generateBusinessInsights 
} from '../utils/calculations';
import { formatAZN, formatDateAZ, formatPercent } from '../utils/formatters';

interface AnalysisViewProps {
  transactions: Transaction[];
  period: PeriodFilter;
  customStartDate: string;
  customEndDate: string;
  onNavigateToAI: () => void;
  onNavigateToUpload: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  transactions,
  period,
  customStartDate,
  customEndDate,
  onNavigateToAI,
  onNavigateToUpload
}) => {
  const { current: currentRange, previous: prevRange } = getDateRangeForPeriod(
    period,
    customStartDate,
    customEndDate,
    transactions
  );

  const currentTransactions = filterTransactionsByDate(transactions, currentRange);
  const prevTransactions = filterTransactionsByDate(transactions, prevRange);

  const kpis = calculateKPIs(currentTransactions, prevTransactions);
  const salesCategories = getCategoryBreakdown(currentTransactions, 'sale');
  const expenseCategories = getCategoryBreakdown(currentTransactions, 'expense');
  const topProducts = getTopProducts(currentTransactions, 8);
  const timelineData = getTimelineData(currentTransactions);
  const insights = generateBusinessInsights(currentTransactions, kpis);

  if (transactions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Təhlil aparmaq üçün məlumat yoxdur
        </h2>
        <p className="text-slate-600 mb-6 text-sm">
          Biznes təhlillərini görmək üçün əvvəlcə Excel/CSV faylınızı yükləyin və ya nümunə məlumatları aktiv edin.
        </p>
        <button
          onClick={onNavigateToUpload}
          className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl text-xs hover:bg-teal-700 transition-colors"
        >
          Məlumat yüklə
        </button>
      </div>
    );
  }

  // Branch breakdown if branch info exists
  const branchMap = new Map<string, { sales: number; count: number }>();
  currentTransactions
    .filter((t) => t.type === 'sale' && t.branch)
    .forEach((t) => {
      const b = t.branch!;
      const existing = branchMap.get(b) || { sales: 0, count: 0 };
      branchMap.set(b, {
        sales: existing.sales + (t.amount || 0),
        count: existing.count + 1
      });
    });

  const branchList = Array.from(branchMap.entries()).map(([name, data]) => ({
    name,
    sales: data.sales,
    count: data.count,
    share: kpis.totalSales > 0 ? (data.sales / kpis.totalSales) * 100 : 0
  })).sort((a, b) => b.sales - a.sales);

  // Customer activity breakdown
  const customerMap = new Map<string, { total: number; count: number }>();
  currentTransactions
    .filter((t) => t.type === 'sale' && t.customer)
    .forEach((t) => {
      const c = t.customer!;
      const existing = customerMap.get(c) || { total: 0, count: 0 };
      customerMap.set(c, {
        total: existing.total + (t.amount || 0),
        count: existing.count + 1
      });
    });

  const topCustomers = Array.from(customerMap.entries())
    .map(([customer, data]) => ({
      customer,
      total: data.total,
      count: data.count
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Top 3 products revenue concentration
  const top3Revenue = topProducts.slice(0, 3).reduce((acc, p) => acc + p.revenue, 0);
  const top3Share = kpis.totalSales > 0 ? (top3Revenue / kpis.totalSales) * 100 : 0;

  // Operating margin calculation
  const operatingMargin = kpis.totalSales > 0 ? (kpis.operatingResult / kpis.totalSales) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Biznes təhlili
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Məlumatların arxasında duran səbəblər, gəlirlilik strukturu və inkişaf potensialı
          </p>
        </div>

        <button
          onClick={onNavigateToAI}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Süni intellekt köməkçisi ilə dərindən araşdır</span>
        </button>
      </div>

      {/* Analytical Observation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Profitability & Operational Health */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Gəlirlilik və Marja vəziyyəti
            </h3>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 mb-1">
              {operatingMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mb-3">
              İlkin əməliyyat marjası (Gəlir və qeydə alınmış xərclər fərqinin ümumi satışa nisbəti)
            </p>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <div>
                • Hər <span className="font-semibold text-slate-900">100 ₼</span> satışdan təxminən <span className="font-semibold text-teal-800">{formatAZN(operatingMargin)}</span> əməliyyat fərqi qalır.
              </div>
              <div>
                • {operatingMargin >= 20 
                  ? 'Göstərici sağlam səviyyədədir, əməliyyat xərcləri satış axını ilə tam örtülür.' 
                  : 'Marja aşağıdır, xüsusən sabit xərclərin (icarə, əmək haqqı) azaldılması tövsiyə olunur.'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Revenue Concentration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Gəlir konsentrasiyası
            </h3>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 mb-1">
              {top3Share.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mb-3">
              İlk 3 əsas məhsulun ümumi satış dövriyyəsindəki payı
            </p>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <div>
                • Gəlirin əhəmiyyətli hissəsi az sayda məhsula bağlıdır.
              </div>
              <div>
                • {top3Share > 50 
                  ? 'Yüksək konsentrasiya mövcuddur. Əsas məhsullarda tədarük fasiləsi yaranarsa, gəlir ciddi azala bilər.' 
                  : 'Gəlir paylanması yaxşı diversifikasiya olunub.'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Expense Spikes & Stability */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Xərc yükü və strukturu
            </h3>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 mb-1">
              {kpis.totalSales > 0 ? ((kpis.totalExpenses / kpis.totalSales) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Xərclərin ümumi satışa nisbəti
            </p>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              {expenseCategories.length > 0 ? (
                <>
                  <div>
                    • Ən böyük xərc maddəsi: <span className="font-semibold text-slate-900">{expenseCategories[0].category}</span> ({formatAZN(expenseCategories[0].amount)}).
                  </div>
                  <div>
                    • Ümumi xərclərin <span className="font-semibold text-slate-900">{expenseCategories[0].percentage.toFixed(0)}%</span>-i bu istiqamətə sərf olunur.
                  </div>
                </>
              ) : (
                <div>Qeydə alınmış xərc maddəsi yoxdur.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Detailed Tables Split: Category Performance & Branch/Customer Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Categories Detailed Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Kateqoriyalar üzrə detallı göstəricilər
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Məhsul qruplarının dövriyyəsi və əməliyyat sayı
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Kateqoriya</th>
                  <th className="py-2.5 px-3 text-center">Əməliyyat</th>
                  <th className="py-2.5 px-3 text-right">Məbləğ</th>
                  <th className="py-2.5 px-3 text-right">Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {salesCategories.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-900 font-semibold">
                      {cat.category}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {cat.count}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatAZN(cat.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-teal-700 font-semibold">
                      {cat.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Branch / Outlet Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Filiallar üzrə performans müqayisəsi
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Müxtəlif satış nöqtələrinin dövriyyə payı
          </p>

          {branchList.length > 0 ? (
            <div className="space-y-4">
              {branchList.map((branch) => (
                <div key={branch.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-slate-500" />
                      {branch.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatAZN(branch.sales)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, branch.share))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{branch.count} satış əməliyyatı</span>
                    <span>Ümumi dövriyyənin {branch.share.toFixed(1)}%-i</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Yüklənmiş faylda filial və ya şöbə məlumatı qeyd edilməyib.
            </div>
          )}
        </div>

      </div>

      {/* Top Performing Products Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Ən gəlirli məhsullar və satış intensivliyi
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Dövriyyə, satılan miqdar və əgər varsa maya dəyəri üzrə marja
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Məhsul adı</th>
                <th className="py-3 px-4">Kateqoriya</th>
                <th className="py-3 px-4 text-center">Satılan say</th>
                <th className="py-3 px-4 text-right">Ümumi gəlir</th>
                <th className="py-3 px-4 text-right">Maya dəyəri</th>
                <th className="py-3 px-4 text-right">Təxmini marja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {topProducts.map((p, idx) => (
                <tr key={p.name} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-2.5 px-4 text-slate-500">{p.category}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-slate-700">{p.quantity}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatAZN(p.revenue)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                    {p.cost ? formatAZN(p.cost) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-teal-700">
                    {p.grossMargin !== undefined ? `${p.grossMargin.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
