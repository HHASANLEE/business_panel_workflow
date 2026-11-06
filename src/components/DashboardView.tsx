import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  ShoppingBag, 
  CreditCard,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ChevronDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PeriodFilter, Transaction, DataSource } from '../types';
import { 
  formatAZN, 
  formatNumber, 
  formatPercent, 
  formatDateAZ, 
  getPeriodLabel 
} from '../utils/formatters';
import { 
  getDateRangeForPeriod, 
  filterTransactionsByDate, 
  calculateKPIs, 
  getCategoryBreakdown, 
  getTopProducts, 
  getTimelineData, 
  generateBusinessInsights 
} from '../utils/calculations';

interface DashboardViewProps {
  transactions: Transaction[];
  dataSource: DataSource | null;
  period: PeriodFilter;
  onChangePeriod: (period: PeriodFilter) => void;
  customStartDate: string;
  customEndDate: string;
  onUpdateCustomDates: (start: string, end: string) => void;
  onNavigateToUpload: () => void;
  onNavigateToAI: () => void;
  onClearDemoData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  dataSource,
  period,
  onChangePeriod,
  customStartDate,
  customEndDate,
  onUpdateCustomDates,
  onNavigateToUpload,
  onNavigateToAI,
  onClearDemoData
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Compute date ranges
  const { current: currentRange, previous: prevRange } = getDateRangeForPeriod(
    period,
    customStartDate,
    customEndDate,
    transactions
  );

  const currentTransactions = filterTransactionsByDate(transactions, currentRange);
  const prevTransactions = filterTransactionsByDate(transactions, prevRange);

  const kpis = calculateKPIs(currentTransactions, prevTransactions);
  const timelineData = getTimelineData(currentTransactions);
  const salesCategories = getCategoryBreakdown(currentTransactions, 'sale');
  const expenseCategories = getCategoryBreakdown(currentTransactions, 'expense');
  const topProducts = getTopProducts(currentTransactions, 6);
  const insights = generateBusinessInsights(currentTransactions, kpis);

  const periodOptions: { id: PeriodFilter; label: string }[] = [
    { id: 'today', label: 'Bu gün' },
    { id: 'this_week', label: 'Bu həftə' },
    { id: 'this_month', label: 'Bu ay' },
    { id: 'last_3_months', label: 'Son 3 ay' },
    { id: 'this_year', label: 'Bu il' },
    { id: 'all', label: 'Bütün dövr' },
    { id: 'custom', label: 'Fərdi aralıq' }
  ];

  // Tooltip component for Recharts
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs border border-slate-800">
          <p className="font-semibold text-slate-300 mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-semibold text-white">
                {formatAZN(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (transactions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600 border border-slate-200">
          <Receipt className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Biznes məlumatlarınız hələ yüklənməyib
        </h2>
        <p className="text-base text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
          Analiz nəticələrini və qrafikləri görmək üçün Excel və ya CSV faylınızı yükləyin və ya nümunə məlumatlarla sistemi sınayın.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNavigateToUpload}
            className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            Məlumat yüklə
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Demo Notice Banner */}
      {dataSource === 'demo' && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold">Nümunə rejimindəsiniz:</span> Bu göstəricilər nümunə pərakəndə biznesi üçün nümayiş məqsədilə təqdim olunur.
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={onNavigateToUpload}
              className="text-xs font-semibold px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Öz məlumatımı yüklə
            </button>
            <button
              onClick={onClearDemoData}
              className="text-xs font-medium px-2.5 py-1.5 text-amber-800 hover:bg-amber-100/70 rounded-lg transition-colors"
            >
              Nümunəni təmizlə
            </button>
          </div>
        </div>
      )}

      {/* Header and Period Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Biznesinizin ümumi vəziyyəti
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hesabat dövrü: <span className="font-semibold text-slate-700">{formatDateAZ(currentRange.startDate)} – {formatDateAZ(currentRange.endDate)}</span>
            {currentTransactions.length > 0 && (
              <span className="ml-2 text-slate-400">· {currentTransactions.length} əməliyyat</span>
            )}
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200/80">
          {periodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChangePeriod(opt.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                period === opt.id
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Inputs if selected */}
      {period === 'custom' && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Başlanğıc:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onUpdateCustomDates(e.target.value, customEndDate)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Son tarix:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onUpdateCustomDates(customStartDate, e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>
      )}

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Ümumi satışlar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ümumi satışlar
            </span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 mb-1">
            {formatAZN(kpis.totalSales)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {kpis.salesChangePct !== null ? (
              <span className={`inline-flex items-center font-semibold font-mono ${kpis.salesChangePct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {kpis.salesChangePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {formatPercent(kpis.salesChangePct)}
              </span>
            ) : (
              <span className="text-slate-400">Müqayisə yoxdur</span>
            )}
            <span className="text-slate-500 text-[11px]">ötən dövrlə</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Qeydə alınmış satışların ümumi cəmi
          </div>
        </div>

        {/* KPI 2: Ümumi xərclər */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ümumi xərclər
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 mb-1">
            {formatAZN(kpis.totalExpenses)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {kpis.expensesChangePct !== null ? (
              // For expenses: decrease is good (green), increase is bad (red)
              <span className={`inline-flex items-center font-semibold font-mono ${kpis.expensesChangePct <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {kpis.expensesChangePct > 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {formatPercent(kpis.expensesChangePct)}
              </span>
            ) : (
              <span className="text-slate-400">Müqayisə yoxdur</span>
            )}
            <span className="text-slate-500 text-[11px]">ötən dövrlə</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Faktiki qeydə alınmış xərclər
          </div>
        </div>

        {/* KPI 3: İlkin əməliyyat nəticəsi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Əməliyyat fərqi
            </span>
            <div className={`p-1.5 rounded-lg ${kpis.operatingResult >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight mb-1 ${kpis.operatingResult >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatAZN(kpis.operatingResult)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {kpis.operatingResultChangePct !== null ? (
              <span className={`inline-flex items-center font-semibold font-mono ${kpis.operatingResultChangePct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {kpis.operatingResultChangePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {formatPercent(kpis.operatingResultChangePct)}
              </span>
            ) : (
              <span className="text-slate-400">Müqayisə yoxdur</span>
            )}
            <span className="text-slate-500 text-[11px]">ötən dövrlə</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Satışlar çıxılsın qeydə alınan xərclər
          </div>
        </div>

        {/* KPI 4: Satış əməliyyatlarının sayı */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Satış sayı
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 mb-1">
            {formatNumber(kpis.salesCount)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {kpis.salesCountChangePct !== null ? (
              <span className={`inline-flex items-center font-semibold font-mono ${kpis.salesCountChangePct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatPercent(kpis.salesCountChangePct)}
              </span>
            ) : (
              <span className="text-slate-400">Müqayisə yoxdur</span>
            )}
            <span className="text-slate-500 text-[11px]">ötən dövrlə</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Həyata keçirilmiş satış çekləri
          </div>
        </div>

        {/* KPI 5: Orta satış çek məbləği */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Orta çek məbləği
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 mb-1">
            {formatAZN(kpis.averageTicket)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {kpis.averageTicketChangePct !== null ? (
              <span className={`inline-flex items-center font-semibold font-mono ${kpis.averageTicketChangePct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatPercent(kpis.averageTicketChangePct)}
              </span>
            ) : (
              <span className="text-slate-400">Müqayisə yoxdur</span>
            )}
            <span className="text-slate-500 text-[11px]">ötən dövrlə</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Bir satışa düşən orta gəlir
          </div>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Sales & Expenses Timeline */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Satış və xərclərin dinamikası
              </h3>
              <p className="text-xs text-slate-500">
                Günlər üzrə dövriyyə və xərc hərəkəti
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    tickFormatter={(val) => `${val} ₼`} 
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle" 
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    name="Satışlar" 
                    stroke="#0d9488" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#salesGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    name="Xərclər" 
                    stroke="#f43f5e" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#expGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Seçilmiş dövr üçün qrafik məlumatı mövcud deyil.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Revenue by Category */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kateqoriyalar üzrə gəlir bölgüsü
              </h3>
              <p className="text-xs text-slate-500">
                Satışların məhsul qrupları üzrə paylanması
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {salesCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesCategories.slice(0, 5)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="category" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    tickFormatter={(val) => `${val} ₼`} 
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    name="Satış məbləği" 
                    fill="#0f766e" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Kateqoriya üzrə satış məlumatı yoxdur.
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Top Selling Products */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ən çox gəlir gətirən məhsullar
              </h3>
              <p className="text-xs text-slate-500">
                Məhsullar üzrə satış həcmi və dövriyyə
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((p, idx) => {
                const maxRevenue = topProducts[0].revenue || 1;
                const widthPct = Math.min(100, Math.max(10, (p.revenue / maxRevenue) * 100));
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                        {idx + 1}. {p.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-[11px]">{p.quantity} ədəd</span>
                        <span className="font-mono font-bold text-slate-900">{formatAZN(p.revenue)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Məhsul üzrə satış qeydləri tapılmadı.
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Expenses Structure */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Əsas xərc maddələri
              </h3>
              <p className="text-xs text-slate-500">
                Xərclərin istiqamətlər üzrə bölgüsü
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {expenseCategories.length > 0 ? (
              expenseCategories.slice(0, 6).map((c, idx) => {
                const maxAmt = expenseCategories[0].amount || 1;
                const widthPct = Math.min(100, Math.max(10, (c.amount / maxAmt) * 100));
                return (
                  <div key={c.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                        {idx + 1}. {c.category}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-[11px]">{c.percentage.toFixed(1)}%</span>
                        <span className="font-mono font-bold text-slate-900">{formatAZN(c.amount)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Qeydə alınmış xərc əməliyyatı yoxdur.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Automated Business Insights & AI Assistant Callout */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Süni İntellekt Təhlili</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Sürətli biznes müşahidələri
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Faktiki məlumatlarınıza əsaslanan avtomatik təhlil xülasəsi
            </p>
          </div>

          <button
            onClick={onNavigateToAI}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-colors shadow-sm self-start md:self-auto shrink-0"
          >
            <span>Köməkçiyə sual ver</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Insight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {insights.length > 0 ? (
            insights.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-300">
                      {item.title}
                    </span>
                    {item.metricBadge && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-200">
                        {item.metricBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-xs text-slate-400">
              Kifayət qədər məlumat toplandıqdan sonra burada avtomatik biznes təhlilləri göstəriləcək.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
