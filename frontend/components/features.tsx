'use client';

import { motion } from 'motion/react';
import { Gavel, BadgeCheck, Lock, MessageSquare, TrendingUp } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <Gavel className="w-5 h-5" />,
      title: 'Аукционная система',
      description: 'Прозрачные торги за проекты, честная конкуренция.',
    },
    {
      icon: <BadgeCheck className="w-5 h-5" />,
      title: 'Верификация',
      description: 'Строгая проверка личности и навыков каждого исполнителя.',
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Эскроу-платежи',
      description: 'Гарантия безопасности для обеих сторон сделки.',
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Быстрый чат',
      description: 'Удобный мессенджер с обменом файлами внутри платформы.',
    },
  ];

  return (
    <section className="py-24 bg-slate-card/20 border-y border-slate-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Почему выбирают freelancer.md?</h2>
            <p className="text-slate-400 text-lg mb-8">Мы создали экосистему, где профессионализм встречается с безопасностью. Забудьте о рисках и сорванных дедлайнах.</p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="mt-1 text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-96 rounded-2xl overflow-hidden shadow-2xl border border-slate-border bg-slate-card/50 flex flex-col items-center justify-center gap-6 p-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white mb-1">$2,400</p>
              <p className="text-slate-400 text-sm">средний чек закрытой сделки</p>
            </div>
            <div className="w-full bg-slate-card/80 backdrop-blur-md p-4 rounded-xl border border-slate-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-xs text-slate-300 font-mono">LIVE UPDATE</p>
              </div>
              <p className="text-white font-semibold">Новая сделка успешно закрыта: <span className="text-primary">$2,400</span></p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
