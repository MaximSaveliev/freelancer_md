'use client';

import { motion } from 'motion/react';
import { Terminal, Palette, Megaphone, Languages, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Categories() {
  const categories = [
    {
      icon: <Terminal className="w-6 h-6" />,
      title: 'Разработка',
      tags: ['Web', 'Mobile', 'DevOps'],
      colorClass: 'bg-blue-500/10 text-blue-400',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Дизайн',
      tags: ['UI/UX', 'Лого', '3D'],
      colorClass: 'bg-purple-500/10 text-purple-400',
    },
    {
      icon: <Megaphone className="w-6 h-6" />,
      title: 'Маркетинг',
      tags: ['SMM', 'SEO', 'Context'],
      colorClass: 'bg-green-500/10 text-green-400',
    },
    {
      icon: <Languages className="w-6 h-6" />,
      title: 'Тексты и Переводы',
      tags: ['Копирайтинг', 'EN/RU'],
      colorClass: 'bg-yellow-500/10 text-yellow-400',
    },
  ];

  return (
    <section className="py-24 bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Популярные категории</h2>
            <p className="text-slate-400">Найдите экспертов в любой области</p>
          </div>
          <Link href="#" className="hidden sm:flex items-center text-primary font-medium hover:text-white transition-colors group">
            Все категории <ArrowRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href="#" className="block group p-6 bg-slate-card border border-slate-border rounded-2xl hover:border-primary/50 hover:bg-slate-card/80 transition-all duration-300 h-full">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${category.colorClass}`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{category.title}</h3>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  {category.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="bg-background-dark px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
