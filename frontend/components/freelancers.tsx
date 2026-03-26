'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { listProfiles } from '@/lib/api/bl';
import { Avatar } from '@/components/avatar';
import type { Profile } from '@/lib/types';

const GRADE_LABEL: Record<string, string> = {
  JUNIOR: 'Junior Freelancer',
  MIDDLE: 'Middle Freelancer',
  SENIOR: 'Senior Freelancer',
  EXPERT: 'Expert Freelancer',
};

export function Freelancers() {
  const [freelancers, setFreelancers] = useState<Profile[]>([]);

  useEffect(() => {
    listProfiles({ role: 'FREELANCER', limit: 4 })
      .then(setFreelancers)
      .catch(() => {});
  }, []);

  return (
    <section className="py-24 bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8">Топовые исполнители</h2>

        {freelancers.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500">Загрузка...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {freelancers.map((freelancer, index) => (
              <motion.div
                key={freelancer.user_id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-card border border-slate-border rounded-2xl p-6 flex flex-col items-center text-center"
              >
                <div className="relative mb-4">
                  <Avatar
                    src={freelancer.avatar_url ?? null}
                    name={`${freelancer.first_name} ${freelancer.last_name}`}
                    size={80}
                    className={`border-2 ${freelancer.is_verified ? 'border-primary' : 'border-slate-600'}`}
                  />
                  {freelancer.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-background-dark rounded-full p-1">
                      <BadgeCheck className="w-4 h-4 font-bold" />
                    </div>
                  )}
                </div>

                <h4 className="text-white font-bold text-lg">
                  {freelancer.first_name} {freelancer.last_name}
                </h4>
                <p className="text-primary text-sm font-medium mb-3">
                  {freelancer.grade ? GRADE_LABEL[freelancer.grade] : 'Freelancer'}
                </p>

                <div className="flex items-center gap-1 text-yellow-400 text-sm mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{freelancer.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({freelancer.review_count} отзывов)</span>
                </div>

                <Link
                  href={`/freelancers/${freelancer.user_id}`}
                  className="w-full py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer mt-auto"
                >
                  Профиль
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
