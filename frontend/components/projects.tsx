'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { listProjects } from '@/lib/api/bl';
import type { Project, ProjectBudget } from '@/lib/types';

function formatBudget(budget: ProjectBudget | null): string {
  if (!budget) return 'Договорная';
  if (budget.amount != null) return `$${budget.amount.toLocaleString('en-US')}`;
  if (budget.min != null && budget.max != null) return `$${budget.min} – $${budget.max}`;
  return 'Договорная';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (hours < 1) return 'Только что';
  if (hours < 24) return `${hours} ч. назад`;
  if (days === 1) return 'Вчера';
  return `${days} дн. назад`;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    listProjects({ status: 'OPEN', limit: 3 })
      .then(setProjects)
      .catch(() => {});
  }, []);

  return (
    <section className="py-24 bg-slate-card/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8">Свежие проекты</h2>

        {projects.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500">Загрузка...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-card border border-slate-border rounded-2xl p-6 hover:border-primary/30 transition-colors flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
                    {project.payment_type === 'AUCTION' ? 'Аукцион' : project.payment_type === 'HOURLY' ? 'Почасовая' : 'Фиксированная'}
                  </span>
                  <span className="text-slate-500 text-xs">{timeAgo(project.created_at)}</span>
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
                    <p className="text-white font-bold">{formatBudget(project.budget)}</p>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-sm font-medium text-white hover:text-primary transition-colors cursor-pointer"
                  >
                    Откликнуться
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
