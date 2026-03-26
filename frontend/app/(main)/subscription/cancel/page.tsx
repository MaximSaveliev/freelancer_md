'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-card border border-slate-border rounded-3xl p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-slate-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Оплата отменена</h1>
        <p className="text-slate-400 mb-8">
          Вы отменили оплату. Ваш текущий план не изменился.
        </p>

        <button
          onClick={() => router.push('/settings')}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться в настройки
        </button>
      </motion.div>
    </div>
  );
}
