'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle2, Crown, Zap, ArrowRight } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    import('@/lib/api/payment').then(({ getSubscription }) => {
      getSubscription(userId)
        .then((sub) => {
          setPlan(sub.plan);
          localStorage.setItem('userPlan', sub.plan);
        })
        .catch(() => {});
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-card border border-slate-border rounded-3xl p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Оплата прошла успешно!</h1>

        {plan && plan !== 'basic' ? (
          <div className="mb-6">
            <p className="text-slate-400 mb-4">Ваша подписка активирована:</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${
              plan === 'premium'
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30'
                : 'bg-primary/20 text-primary border border-primary/30'
            }`}>
              {plan === 'premium' ? <Crown className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              {plan === 'premium' ? 'Premium' : 'PRO'}
            </div>
          </div>
        ) : (
          <p className="text-slate-400 mb-6">
            Ваша подписка активирована. Спасибо за покупку!
          </p>
        )}

        <button
          onClick={() => router.push('/settings')}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors"
        >
          Перейти в настройки
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
