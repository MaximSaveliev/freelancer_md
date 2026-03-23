'use client';

import { motion } from 'motion/react';

export function Stats() {
  const stats = [
    { value: '10k+', label: 'Проверенных фрилансеров' },
    { value: '1k+', label: 'Активных компаний' },
    { value: '$5M+', label: 'Выплачено через эскроу' },
    { value: '24ч', label: 'Среднее время найма' },
  ];

  return (
    <div className="border-y border-slate-border bg-slate-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
