import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  HelpCircle, 
  AlertCircle, 
  Loader2, 
  User, 
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Database
} from 'lucide-react';
import { ChatMessage, PeriodFilter, Transaction } from '../types';
import { 
  getDateRangeForPeriod, 
  filterTransactionsByDate, 
  calculateKPIs, 
  getCategoryBreakdown, 
  getTopProducts 
} from '../utils/calculations';
import { formatAZN, formatDateAZ } from '../utils/formatters';

interface AiAssistantViewProps {
  transactions: Transaction[];
  businessName: string;
  businessCategory: string;
  period: PeriodFilter;
  customStartDate: string;
  customEndDate: string;
  onNavigateToUpload: () => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  transactions,
  businessName,
  businessCategory,
  period,
  customStartDate,
  customEndDate,
  onNavigateToUpload
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Salam! Mən sizin "Biznes köməkçisi"nizəm.

Yüklədiyiniz biznes məlumatlarını dərindən təhlil edib, suallarınızı cavablandırmağa və inkişaf imkanlarını tapmağa hazıram. 

Aşağıdakı hazır suallardan birini seçə və ya öz sualınızı yaza bilərsiniz.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Compute current business metrics context to ground the AI model
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
  const topProducts = getTopProducts(currentTransactions, 6);

  const suggestedQuestions = [
    'Satışlarımı analiz et',
    'Xərclərimi yoxla',
    'Ən yaxşı məhsullarımı göstər',
    'Mənfəətimi artırmaq üçün nə edə bilərəm?',
    'Gələn ay üçün proqnoz və tövsiyələr ver'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    setErrorMessage(null);
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Prepare strictly grounded analytical context
    const businessContext = {
      businessName: businessName || 'Mənim Biznesim',
      businessCategory,
      reportingPeriod: {
        startDate: currentRange.startDate,
        endDate: currentRange.endDate,
        totalTransactionsCount: currentTransactions.length
      },
      kpis: {
        totalSales: kpis.totalSales,
        totalExpenses: kpis.totalExpenses,
        operatingResult: kpis.operatingResult,
        salesCount: kpis.salesCount,
        averageTicket: kpis.averageTicket,
        salesChangePercentage: kpis.salesChangePct,
        expensesChangePercentage: kpis.expensesChangePct,
        operatingResultChangePercentage: kpis.operatingResultChangePct
      },
      topProducts: topProducts.map((p) => ({
        name: p.name,
        category: p.category,
        revenue: p.revenue,
        quantity: p.quantity,
        cost: p.cost
      })),
      salesCategories: salesCategories.map((c) => ({
        category: c.category,
        amount: c.amount,
        percentage: c.percentage
      })),
      expenseCategories: expenseCategories.map((e) => ({
        category: e.category,
        amount: e.amount,
        percentage: e.percentage
      }))
    };

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          businessContext,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server cavab vermədi');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || 'Təhlil hazırlandı.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('AI chat xətası:', err);
      setErrorMessage(
        err.message || 'Süni intellekt köməkçisi ilə əlaqə qurularkən xəta baş verdi. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        content: 'Söhbət tarixçəsi yeniləndi. Biznesinizlə bağlı nəyi bilmək istəyirsiniz?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header and Context Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-teal-400 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Biznes köməkçisi
              </h1>
              <p className="text-xs text-slate-500">
                Faktiki satış və xərc məlumatlarınıza əsaslanan süni intellekt analitiki
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Context Indicator */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-slate-600">
              Aktiv dövr: <span className="font-semibold text-slate-900">{formatDateAZ(currentRange.startDate)} – {formatDateAZ(currentRange.endDate)}</span> ({currentTransactions.length} əməliyyat)
            </span>
          </div>
          <button
            onClick={handleClearHistory}
            className="text-slate-400 hover:text-slate-700 p-1"
            title="Söhbəti yenilə"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Warning if no transactions */}
      {transactions.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Məlumat yüklənməyib. Köməkçi yalnız ümumi biznes məlumatları verə biləcək. Dəqiq analiz üçün fayl yükləyin.</span>
          </div>
          <button
            onClick={onNavigateToUpload}
            className="font-bold underline shrink-0 hover:text-amber-800"
          >
            Məlumat yüklə
          </button>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center shrink-0 text-xs font-bold shadow-sm">
                    BP
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-none shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-[10px] mt-2 text-right ${
                      isUser ? 'text-teal-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center shrink-0 text-xs font-bold">
                BP
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-none p-4 text-xs text-slate-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span>Məlumatlar təhlil olunur və cavab hazırlanır...</span>
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Buttons */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap pl-1">
            Tövsiyə olunan:
          </span>
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 whitespace-nowrap transition-colors shadow-2xs disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Biznesinizlə bağlı sualınızı yazın... (Məs: Ən çox xərc hansı sahəyə gedir?)"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white rounded-xl transition-colors shadow-sm shrink-0"
              aria-label="Göndər"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[11px] text-slate-400 text-center mt-2">
            Cavablar faktiki daxil edilmiş məlumatlar əsasında formalaşdırılır və heç bir rəqəm uydurulmur.
          </div>
        </div>

      </div>

    </div>
  );
};
