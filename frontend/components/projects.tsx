'use client';

import { motion } from 'motion/react';

export function Projects() {
  const projects = [
    {
      title: 'Интернет-магазин на Laravel',
      description: 'Нужно разработать кастомный интернет-магазин с интеграцией 1С и платежных систем Молдовы.',
      budget: '$2,000 - $3,500',
      time: '2 часа назад',
    },
    {
      title: 'Дизайн мобильного приложения',
      description: 'Ищем UI/UX дизайнера для финтех стартапа. Требуется опыт работы в Figma и наличие портфолио.',
      budget: '$800 - $1,200',
      time: '4 часа назад',
    },
    {
      title: 'SEO оптимизация сайта',
      description: 'Полный аудит и внутренняя оптимизация корпоративного сайта на WordPress.',
      budget: '$400 - $600',
      time: 'Вчера',
    },
  ];

  return (
    <section className="py-24 bg-slate-card/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8">Свежие проекты</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-slate-card border border-slate-border rounded-2xl p-6 hover:border-primary/30 transition-colors flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">Эскроу готов</span>
                <span className="text-slate-500 text-xs">{project.time}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 leading-tight hover:text-primary cursor-pointer transition-colors">
                {project.title}
              </h3>
              
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
                {project.description}
              </p>
              
              <div className="flex items-center justify-between border-t border-slate-border pt-4 mt-auto">
                <div>
                  <p className="text-xs text-slate-500">Бюджет</p>
                  <p className="text-white font-bold">{project.budget}</p>
                </div>
                <button className="text-sm font-medium text-white hover:text-primary transition-colors cursor-pointer">
                  Откликнуться
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
