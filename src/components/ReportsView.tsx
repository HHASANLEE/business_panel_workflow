import React, { useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Building2, 
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Receipt
} from 'lucide-react';
import { PeriodFilter, Transaction } from '../types';
import { 
  getDateRangeForPeriod, 
  filterTransactionsByDate, 
  calculateKPIs, 
  getCategoryBreakdown, 
  getTopProducts 
} from '../utils/calculations';
import { formatAZN, formatDateAZ } from '../utils/formatters';

interface ReportsViewProps {
  transactions: Transaction[];
  businessName: string;
  businessCategory: string;
  period: PeriodFilter;
  customStartDate: string;
  customEndDate: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  businessName,
  businessCategory,
  period,
  customStartDate,
  customEndDate
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
  const topProducts = getTopProducts(currentTransactions, 10);

  // Export full transactions to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (currentTransactions.length === 0) return;

    let csvContent = '\uFEFFTarix,Növ,Məhsul/Xidmət,Kateqoriya,Məbləğ (AZN),Miqdar,Müştəri,Filial\n';

    currentTransactions.forEach((t) => {
      const typeStr = t.type === 'sale' ? 'Satış' : 'Xərc';
      const cleanProd = (t.productName || '').replace(/,/g, ' ');
      const cleanCat = (t.category || '').replace(/,/g, ' ');
      const cleanCust = (t.customer || '').replace(/,/g, ' ');
      const cleanBranch = (t.branch || '').replace(/,/g, ' ');
      csvContent += `${formatDateAZ(t.date)},${typeStr},"${cleanProd}","${cleanCat}",${t.amount},${t.quantity || 1},"${cleanCust}","${cleanBranch}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BiznesPanel_Hesabat_${currentRange.startDate}_${currentRange.endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = formatDateAZ(new Date().toISOString().split('T')[0]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Maliyyə və fəaliyyət hesabatı
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Seçilmiş dövr üzrə rəsmi biznes xülasəsini nəzərdən keçirin və ixrac edin
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={currentTransactions.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV kimi yüklə</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={currentTransactions.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Çap et / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-slate-900">{businessName || 'Xəzər Market'}</span>
              <span className="text-xs text-slate-500 font-medium">({businessCategory || 'Pərakəndə satış'})</span>
            </div>
            <div className="text-xs text-slate-500">
              BiznesPanel Avtomatlaşdırılmış İdarəetmə Hesabatı
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
            <div>
              <span className="font-semibold text-slate-700">Hesabat dövrü:</span> {formatDateAZ(currentRange.startDate)} – {formatDateAZ(currentRange.endDate)}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Tərtib tarixi:</span> {todayStr}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Əməliyyat sayı:</span> {currentTransactions.length}
            </div>
          </div>
        </div>

        {/* Financial KPI Summary Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Əsas Maliyyə Nəticələri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Ümumi Satış Gəliri</div>
              <div className="text-xl font-bold font-mono text-teal-800 mt-1">
                {formatAZN(kpis.totalSales)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {kpis.salesCount} satış əməliyyatı
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Qeydə Alınmış Xərclər</div>
              <div className="text-xl font-bold font-mono text-rose-700 mt-1">
                {formatAZN(kpis.totalExpenses)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Bütün əməliyyat xərcləri
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">İlkin Əməliyyat Nəticəsi</div>
              <div className={`text-xl font-bold font-mono mt-1 ${kpis.operatingResult >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatAZN(kpis.operatingResult)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Satış və xərc fərqi
              </div>
            </div>
          </div>
        </div>

        {/* Sales by Category Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Kateqoriyalar üzrə Satışlar
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Kateqoriya</th>
                  <th className="py-2.5 px-4 text-center">Əməliyyat sayı</th>
                  <th className="py-2.5 px-4 text-right">Məbləğ</th>
                  <th className="py-2.5 px-4 text-right">Ümumi pay (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {salesCategories.map((c) => (
                  <tr key={c.category}>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{c.category}</td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-600">{c.count}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatAZN(c.amount)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-teal-700 font-semibold">{c.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses by Category Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            3. Xərclərin İcra Strukturu
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Xərc maddəsi</th>
                  <th className="py-2.5 px-4 text-center">Ödəniş sayı</th>
                  <th className="py-2.5 px-4 text-right">Məbləğ</th>
                  <th className="py-2.5 px-4 text-right">Xərc payı (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenseCategories.map((e) => (
                  <tr key={e.category}>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{e.category}</td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-600">{e.count}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700">{formatAZN(e.amount)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700 font-semibold">{e.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 Products Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            4. Ən Çox Satılan Məhsullar
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Məhsul adı</th>
                  <th className="py-2.5 px-4">Kateqoriya</th>
                  <th className="py-2.5 px-4 text-center">Satılan say</th>
                  <th className="py-2.5 px-4 text-right">Gəlir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {topProducts.map((p, idx) => (
                  <tr key={p.name}>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{p.name}</td>
                    <td className="py-2.5 px-4 text-slate-500">{p.category}</td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-700">{p.quantity}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatAZN(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            * Bu hesabat BiznesPanel platformasında qeydə alınmış faktiki daxili əməliyyat məlumatları əsasında avtomatik formalaşdırılmışdır.
          </div>
          <div className="shrink-0 font-medium text-slate-500">
            BiznesPanel · Azərbaycan
          </div>
        </div>

      </div>

    </div>
  );
};
