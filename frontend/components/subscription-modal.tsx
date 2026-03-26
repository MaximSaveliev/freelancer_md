'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Zap, Crown, TrendingUp, Star, ShieldCheck } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'free' | 'pro' | 'premium';
  onUpgrade: (plan: 'pro' | 'premium') => void;
}

export default function SubscriptionModal({ isOpen, onClose, currentPlan, onUpgrade }: SubscriptionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium' | null>(null);

  const handleUpgrade = (plan: 'pro' | 'premium') => {
    setSelectedPlan(plan);
    setIsProcessing(true);
    onUpgrade(plan);
    // onUpgrade will redirect to Stripe Checkout, so no need to reset state
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background-dark/90 backdrop-blur-md"
            onClick={() => !isProcessing && onClose()}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-slate-card border border-slate-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-slate-border/50 flex justify-between items-start shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
              
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Прокачайте свой профиль
                </h2>
                <p className="text-slate-400 text-sm sm:text-base">
                  Выберите план, который подходит именно вам, чтобы получать больше заказов, выделяться среди конкурентов и зарабатывать больше.
                </p>
              </div>
              <button 
                onClick={() => !isProcessing && onClose()}
                className="text-slate-400 hover:text-white transition-colors relative z-10 bg-slate-800/50 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                
                {/* PRO Plan */}
                <div className={`relative bg-slate-800/30 border ${currentPlan === 'pro' ? 'border-primary' : 'border-slate-700/50'} rounded-2xl p-6 sm:p-8 flex flex-col transition-all hover:border-primary/50`}>
                  {currentPlan === 'pro' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-background-dark text-xs font-bold uppercase tracking-wider rounded-full">
                      Текущий план
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">PRO</h3>
                      <p className="text-sm text-primary">Профессиональный старт</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-white">$9.99</span>
                      <span className="text-slate-400">/ мес</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                      Выделитесь среди новичков и получите больше рабочих инструментов.
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-medium block mb-0.5">Бейдж PRO в профиле</span>
                        <span className="text-sm text-slate-400">Стильная неоновая иконка рядом с именем, повышающая доверие.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-medium block mb-0.5">Поднятие в поиске</span>
                        <span className="text-sm text-slate-400">Ваш профиль отображается выше бесплатных аккаунтов.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-medium block mb-0.5">5 откликов в неделю</span>
                        <span className="text-sm text-slate-400">Расширенный лимит на подачу заявок (вместо 2).</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-medium block mb-0.5">До 10 ключевых навыков</span>
                        <span className="text-sm text-slate-400">Укажите больше навыков, чтобы чаще попадать в фильтры.</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleUpgrade('pro')}
                    disabled={currentPlan === 'pro' || currentPlan === 'premium' || isProcessing}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      currentPlan === 'pro' 
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                        : currentPlan === 'premium'
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
                    }`}
                  >
                    {isProcessing && selectedPlan === 'pro' ? (
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    ) : currentPlan === 'pro' ? (
                      'Активен'
                    ) : currentPlan === 'premium' ? (
                      'План ниже текущего'
                    ) : (
                      'Выбрать PRO'
                    )}
                  </button>
                </div>

                {/* Premium Plan */}
                <div className={`relative bg-gradient-to-b from-[#1A1525] to-slate-800/30 border ${currentPlan === 'premium' ? 'border-amber-400' : 'border-amber-400/30'} rounded-2xl p-6 sm:p-8 flex flex-col transition-all hover:border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.05)]`}>
                  {currentPlan === 'premium' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-background-dark text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                      Текущий план
                    </div>
                  )}
                  
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-blue-500/20 border border-amber-400/30 rounded-xl flex items-center justify-center shrink-0">
                      <Crown className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Premium</h3>
                      <p className="text-sm text-amber-400">Лидер рынка</p>
                    </div>
                  </div>
                  
                  <div className="mb-6 relative z-10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">$19.99</span>
                      <span className="text-slate-400">/ мес</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                      Максимальная конверсия и эксклюзивная информация.
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-8 flex-1 relative z-10">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-medium block mb-0.5">Все преимущества PRO</span>
                        <span className="text-sm text-slate-400">Включая 10 навыков и 5 откликов.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-medium block mb-0.5">Бейдж Premium</span>
                        <span className="text-sm text-slate-400">Эксклюзивный статус и золотисто-голубая обводка аватара.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-medium block mb-0.5 flex items-center gap-2">
                          Видимость ставок (Bid Insights) <ShieldCheck className="w-4 h-4 text-amber-400" />
                        </span>
                        <span className="text-sm text-slate-400">Видите среднюю предложенную цену по проекту в аукционах.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-medium block mb-0.5 flex items-center gap-2">
                          Закрепление в Топе <TrendingUp className="w-4 h-4 text-amber-400" />
                        </span>
                        <span className="text-sm text-slate-400">3 раза в месяц закрепляйте профиль на 1-й строчке на 24 часа.</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleUpgrade('premium')}
                    disabled={currentPlan === 'premium' || isProcessing}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${
                      currentPlan === 'premium' 
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-background-dark shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                    }`}
                  >
                    {isProcessing && selectedPlan === 'premium' ? (
                      <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                    ) : currentPlan === 'premium' ? (
                      'Активен'
                    ) : (
                      'Выбрать Premium'
                    )}
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
