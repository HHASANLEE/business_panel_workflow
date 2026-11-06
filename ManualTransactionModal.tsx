import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
}

export const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction
}) => {
  const [date, setDate] = useState('2026-11-01');
  const [type, setType] = useState<TransactionType>('sale');
  const [amount, setAmount] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [customer, setCustomer] = useState('');
  const [branch, setBranch] = useState('Nərimanov filialı');
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Zəhmət olmasa düzgün məbləğ daxil edin.');
      return;
    }

    if (!date) {
      setError('Tarix mütləq seçilməlidir.');
      return;
    }

    const newTx: Transaction = {
      id: `USR-MANUAL-${Date.now()}`,
      date,
      type,
      amount: numAmount,
      productName: productName.trim() || (type === 'sale' ? 'Pərakəndə satış' : 'Əməliyyat xərci'),
      category: category.trim() || (type === 'sale' ? 'Ümumi satış' : 'Digər xərc'),
      quantity: parseInt(quantity, 10) || 1,
      customer: customer.trim() || undefined,
      branch: branch.trim() || undefined,
      reference: reference.trim() || undefined,
      dataSource: 'user'
    };

    onAddTransaction(newTx);
    onClose();

    // Reset form
    setAmount('');
    setProductName('');
    setCategory('');
    setCustomer('');
    setReference('');
  };

  const saleCategories = ['Ərzaq və içkilər', 'Məişət kimyası', 'Meyvə və tərəvəz', 'Geyim və tekstil', 'Xidmət haqqı', 'Digər'];
  const expenseCategories = ['İcarə xərcləri', 'Əmək haqqı', 'Kommunal xərclər', 'Logistika və nəqliyyat', 'Marketinq və reklam', 'Bank komissiyası', 'Təsərrüfat'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Yeni əməliyyat əlavə et
            </h3>
            <p className="text-xs text-slate-500">
              Fərdi satış və ya xərc qeydini sistemə daxil edin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Type Toggle */}
          <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setType('sale')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                type === 'sale'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satış gəliri (+)
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xərc ödənişi (-)
            </button>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tarix *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Məbləğ (AZN / ₼) *
              </label>
              <input
                type="text"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white font-mono font-semibold"
              />
            </div>
          </div>

          {/* Title / Product Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {type === 'sale' ? 'Məhsul və ya xidmət adı' : 'Xərcin təyinatı'}
            </label>
            <input
              type="text"
              placeholder={type === 'sale' ? 'Məs: Lavazza Qəhvə 1 kq' : 'Məs: Mağazanın aylıq icarəsi'}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kateqoriya
            </label>
            <input
              type="text"
              list="category-suggestions"
              placeholder="Kateqoriya adı yazın və ya seçin"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white"
            />
            <datalist id="category-suggestions">
              {(type === 'sale' ? saleCategories : expenseCategories).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Quantity and Branch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Miqdar (Say)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filial / Şöbə
              </label>
              <input
                type="text"
                placeholder="Məs: Nərimanov filialı"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Customer / Ref */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Müştəri / Qarşı tərəf
              </label>
              <input
                type="text"
                placeholder="Məs: Əli Məmmədov"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Çek / Qaimə №
              </label>
              <input
                type="text"
                placeholder="Məs: CHK-204"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Əlavə et</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
