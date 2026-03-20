'use client';

import { motion } from 'motion/react';
import { Briefcase, User, CheckCircle2 } from 'lucide-react';

export function Pricing() {
  return (
    <section className="py-24 bg-slate-card/20 border-y border-slate-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Прозрачные тарифы</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Business Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-slate-card border border-slate-border rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Briefcase className="w-24 h-24" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Для Бизнеса</h3>
            <div className="text-4xl font-black text-primary mb-6">
              0% <span className="text-lg font-medium text-slate-400">комиссия</span>
            </div>
            
            <ul className="space-y-4 mb-8 text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Бесплатная публикация проектов
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Доступ к базе фрилансеров
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Безопасная сделка (Эскроу)
              </li>
            </ul>
            
            <button className="w-full py-3 rounded-xl bg-white text-background-dark font-bold hover:bg-slate-200 transition-colors cursor-pointer">
              Начать нанимать
            </button>
          </motion.div>

          {/* Freelancer Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-card border border-primary/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(19,200,236,0.1)]"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <User className="w-24 h-24 text-primary" />
            </div>
            <div className="absolute top-4 right-4">
              <span className="bg-primary text-background-dark text-xs font-bold px-3 py-1 rounded-full">Fair Play</span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Для Фрилансеров</h3>
            <div className="text-4xl font-black text-white mb-6">
              10% <span className="text-lg font-medium text-slate-400">комиссия</span>
            </div>
            
            <ul className="space-y-4 mb-8 text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Платите только при получении оплаты
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Неограниченные отклики
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Защита от неоплаты
              </li>
            </ul>
            
            <button className="w-full py-3 rounded-xl bg-primary text-background-dark font-bold hover:bg-primary/90 transition-colors cursor-pointer">
              Создать профиль
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
