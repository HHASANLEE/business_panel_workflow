import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { ColumnMapping, ImportValidationResult, Transaction, TransactionType } from '../types';
import { 
  autoDetectColumnMapping, 
  processRawRows, 
  downloadSampleExcel, 
  downloadSampleCSV 
} from '../utils/importer';
import { formatAZN, formatDateAZ } from '../utils/formatters';

interface DataImportViewProps {
  transactions: Transaction[];
  onImportSuccess: (newTransactions: Transaction[], isDemo: boolean) => void;
  onDeleteTransaction: (id: string) => void;
  onClearAllTransactions: () => void;
  onOpenManualModal: () => void;
}

export const DataImportView: React.FC<DataImportViewProps> = ({
  transactions,
  onImportSuccess,
  onDeleteTransaction,
  onClearAllTransactions,
  onOpenManualModal
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File parsing states
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [rawSheetRows, setRawSheetRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateCol: '',
    typeCol: '',
    amountCol: '',
    categoryCol: '',
    productCol: '',
    customerCol: '',
    quantityCol: '',
    unitPriceCol: '',
    branchCol: ''
  });

  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Table viewer search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'expense'>('all');

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    parseFile(file);
  };

  const parseFile = (file: File) => {
    setFileError(null);
    setIsProcessing(true);
    setSelectedFileName(file.name);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv');

    if (!isExcel && !isCsv) {
      setFileError('Yalnız Excel (.xlsx, .xls) və ya CSV (.csv) faylları dəstəklənir.');
      setIsProcessing(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const wb = XLSX.read(data, { type: 'binary', cellDates: true });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);

        if (wb.SheetNames.length > 0) {
          const firstSheet = wb.SheetNames[0];
          setActiveSheet(firstSheet);
          loadSheetData(wb, firstSheet);
        }
      } catch (err: any) {
        console.error('Fayl oxunarkən xəta:', err);
        setFileError('Faylın strukturunu oxumaq mümkün olmadı. Zəhmət olmasa faylın zədələnmədiyini yoxlayın.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setFileError('Fayl oxunarkən xəta baş verdi.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  // Load selected sheet data
  const loadSheetData = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (!jsonData || jsonData.length === 0) {
      setFileError('Seçilmiş vərəqdə heç bir məlumat tapılmadı.');
      setRawSheetRows([]);
      setHeaders([]);
      setValidationResult(null);
      return;
    }

    setRawSheetRows(jsonData);

    // Extract headers
    const cols = Object.keys(jsonData[0]);
    setHeaders(cols);

    // Auto-detect mapping
    const detectedMapping = autoDetectColumnMapping(cols);
    setMapping(detectedMapping);

    // Validate with initial mapping
    const res = processRawRows(jsonData, detectedMapping);
    setValidationResult(res);
  };

  // Switch sheet
  const handleSheetChange = (sheetName: string) => {
    setActiveSheet(sheetName);
    if (workbook) {
      loadSheetData(workbook, sheetName);
    }
  };

  // Update mapping field and revalidate
  const handleMappingChange = (field: keyof ColumnMapping, val: string) => {
    const updated = { ...mapping, [field]: val };
    setMapping(updated);
    if (rawSheetRows.length > 0) {
      const res = processRawRows(rawSheetRows, updated);
      setValidationResult(res);
    }
  };

  // Confirm import
  const handleConfirmImport = () => {
    if (!validationResult || validationResult.parsedTransactions.length === 0) {
      setFileError('Yüklənəcək etibarlı əməliyyat tapılmadı.');
      return;
    }

    onImportSuccess(validationResult.parsedTransactions, false);
    resetUploadState();
  };

  // Cancel import
  const resetUploadState = () => {
    setSelectedFileName(null);
    setWorkbook(null);
    setSheetNames([]);
    setRawSheetRows([]);
    setHeaders([]);
    setValidationResult(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filter existing transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      searchTerm === '' ||
      t.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.branch?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'sale' && t.type === 'sale') ||
      (typeFilter === 'expense' && t.type === 'expense');

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Məlumatların idarə edilməsi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Excel və ya CSV fayllarını yükləyin və ya əllə yeni əməliyyat daxil edin
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadSampleExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-sm"
            title="Excel formatında nümunə şablon yüklə"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Nümunə Excel (.xlsx)</span>
          </button>

          <button
            onClick={downloadSampleCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-sm"
            title="CSV formatında nümunə şablon yüklə"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Nümunə CSV</span>
          </button>

          <button
            onClick={onOpenManualModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni əməliyyat</span>
          </button>
        </div>
      </div>

      {/* Upload Box / Active Flow */}
      {!selectedFileName ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 hover:border-teal-600 bg-white rounded-2xl p-8 sm:p-12 text-center transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-16 h-16 bg-teal-50 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-700 transition-colors">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Faylınızı bura sürükləyin və ya kompüterinizdən seçin
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Dəstəklənən formatlar: Microsoft Excel (.xlsx, .xls) və Vergüllə ayrılmış fayllar (.csv)
          </p>

          <button
            type="button"
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Fayl seçin
          </button>
        </div>
      ) : (
        /* Review and Column Matching Flow */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          
          {/* File Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedFileName}
                </h3>
                <p className="text-xs text-slate-500">
                  {rawSheetRows.length} sətir oxundu · Sütun uyğunlaşdırmasını yoxlayın
                </p>
              </div>
            </div>

            {/* Sheet Selector if multiple */}
            {sheetNames.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Vərəq:</span>
                <select
                  value={activeSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none"
                >
                  {sheetNames.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Validation Summary Cards */}
          {validationResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Ümumi sətir</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                  {validationResult.totalRows}
                </div>
              </div>

              <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200">
                <div className="text-[11px] font-semibold text-teal-800 uppercase">Uğurla oxunan</div>
                <div className="text-xl font-bold font-mono text-teal-800 mt-0.5">
                  {validationResult.validRows}
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${validationResult.problemRows > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Problemli sətirlər</div>
                <div className={`text-xl font-bold font-mono mt-0.5 ${validationResult.problemRows > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                  {validationResult.problemRows}
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${validationResult.duplicateRows > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Təkrarlanan qeydlər</div>
                <div className={`text-xl font-bold font-mono mt-0.5 ${validationResult.duplicateRows > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                  {validationResult.duplicateRows}
                </div>
              </div>
            </div>
          )}

          {/* Problem rows alerts if any */}
          {validationResult && validationResult.sampleErrors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Bəzi sətirlərdə çatışmazlıqlar aşkar edildi:</span>
              </div>
              {validationResult.sampleErrors.map((err, i) => (
                <div key={i}>· {err}</div>
              ))}
              <div className="text-slate-500 text-[11px] mt-1 italic">
                * Problemli sətirlər atlanacaq və yalnız düzgün məlumatlar sistemə daxil ediləcək.
              </div>
            </div>
          )}

          {/* Interactive Column Mapping Controls */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900">
              Sütun uyğunlaşdırması
            </h4>
            <p className="text-xs text-slate-500">
              Sistem sütunları avtomatik təyin edib. Əgər hər hansı sahə səhv seçilibsə, siyahıdan düzəldin:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              
              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tarix sütunu *</label>
                <select
                  value={mapping.dateCol}
                  onChange={(e) => handleMappingChange('dateCol', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">Seçin...</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Məbləğ sütunu *</label>
                <select
                  value={mapping.amountCol}
                  onChange={(e) => handleMappingChange('amountCol', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">Seçin...</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Əməliyyat növü (Satış / Xərc)</label>
                <select
                  value={mapping.typeCol}
                  onChange={(e) => handleMappingChange('typeCol', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">Avtomatik (Satış kimi qəbul et)</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Product */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Məhsul və ya xidmət adı</label>
                <select
                  value={mapping.productCol}
                  onChange={(e) => handleMappingChange('productCol', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">(Boş burax)</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kateqoriya</label>
                <select
                  value={mapping.categoryCol}
                  onChange={(e) => handleMappingChange('categoryCol', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">(Ümumi kimi qəbul et)</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Miqdar (Say)</label>
                <select
                  value={mapping.quantityCol}
                  onChange={(e) => handleMappingChange('quantityCol', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">(1 qəbul et)</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Customer */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Müştəri adı</label>
                <select
                  value={mapping.customerCol}
                  onChange={(e) => handleMappingChange('customerCol', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">(Boş)</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Branch */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Filial / Şöbə</label>
                <select
                  value={mapping.branchCol}
                  onChange={(e) => handleMappingChange('branchCol', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">(Boş)</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={resetUploadState}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors"
            >
              Ləğv et
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={!validationResult || validationResult.validRows === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 rounded-xl transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Məlumatları təsdiqlə və əlavə et ({validationResult?.validRows || 0})</span>
            </button>
          </div>

        </div>
      )}

      {/* Error Banner if any */}
      {fileError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {/* Current Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Qeydə alınmış əməliyyatlar ({transactions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Sistemdə saxlanılan bütün gəlir və xərc qeydləri
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white w-40 sm:w-48"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none"
            >
              <option value="all">Bütün növlər</option>
              <option value="sale">Yalnız satışlar</option>
              <option value="expense">Yalnız xərclər</option>
            </select>

            {transactions.length > 0 && (
              <button
                onClick={onClearAllTransactions}
                className="text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors"
                title="Bütün məlumatları təmizlə"
              >
                Təmizlə
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredTransactions.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tarix</th>
                  <th className="py-3 px-4">Növ</th>
                  <th className="py-3 px-4">Məhsul / Xidmət</th>
                  <th className="py-3 px-4">Kateqoriya</th>
                  <th className="py-3 px-4">Filial</th>
                  <th className="py-3 px-4">Müştəri</th>
                  <th className="py-3 px-4 text-right">Miqdar</th>
                  <th className="py-3 px-4 text-right">Məbləğ</th>
                  <th className="py-3 px-4 text-center">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTransactions.slice(0, 50).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatDateAZ(t.date)}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                        t.type === 'sale' 
                          ? 'bg-teal-50 text-teal-800' 
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {t.type === 'sale' ? 'Satış' : 'Xərc'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold truncate max-w-xs">
                      {t.productName || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                      {t.category || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {t.branch || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {t.customer || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      {t.quantity || 1}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-mono font-bold whitespace-nowrap ${
                      t.type === 'sale' ? 'text-teal-700' : 'text-rose-700'
                    }`}>
                      {formatAZN(t.amount)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Bu sətiri sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Heç bir əməliyyat tapılmadı.
            </div>
          )}
        </div>

        {filteredTransactions.length > 50 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            İlk 50 əməliyyat göstərilir. Bütün {filteredTransactions.length} əməliyyat analiz və qrafiklərdə tam nəzərə alınır.
          </div>
        )}

      </div>

    </div>
  );
};
