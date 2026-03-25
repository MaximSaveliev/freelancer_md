'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Star, Clock, CheckCircle2,
  Briefcase, BadgeCheck, MessageSquare, DollarSign, Award
} from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { useParams } from 'next/navigation';
import { getProfile, getProfileSkills, listUserReviews, listPortfolio } from '@/lib/api/bl';
import type { Profile, ProfileSkill, Review, PortfolioItem } from '@/lib/types';

const GRADE_LABEL: Record<string, string> = {
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
  EXPERT: 'Expert',
};

function monthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export default function FreelancerProfilePage() {
  const params = useParams();
  const freelancerId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<ProfileSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfile(freelancerId),
      getProfileSkills(freelancerId).catch(() => [] as ProfileSkill[]),
      listUserReviews(freelancerId).catch(() => [] as Review[]),
      listPortfolio(freelancerId).catch(() => [] as PortfolioItem[]),
    ])
      .then(([prof, sk, rev, port]) => {
        setProfile(prof);
        setSkills(sk);
        setReviews(rev);
        setPortfolio(port);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [freelancerId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Профиль не найден</p>
          <Link href="/freelancers" className="text-primary hover:underline">← Назад к фрилансерам</Link>
        </div>
      </div>
    );
  }

  const avatarUrl = profile.avatar_url ?? null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Back */}
        <Link href="/freelancers" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Назад к фрилансерам
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative shrink-0">
                  <Avatar
                    src={avatarUrl}
                    name={`${profile.first_name} ${profile.last_name}`}
                    size={120}
                    className="border-4 border-slate-700"
                  />
                  {profile.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-background-dark rounded-full p-1">
                      <BadgeCheck className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    {profile.grade && (
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-sm font-bold rounded-lg border border-primary/20">
                        {GRADE_LABEL[profile.grade]}
                      </span>
                    )}
                  </div>

                  {profile.position && (
                    <p className="text-slate-300 text-lg mb-3">{profile.position}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-4">
                    {profile.review_count > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-white">{profile.rating.toFixed(1)}</span>
                        <span>({profile.review_count} отзывов)</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      На платформе с {monthYear(profile.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {profile.completed_count > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Briefcase className="w-4 h-4 text-primary" />
                        {profile.completed_count} проектов
                      </div>
                    )}
                    {profile.success_rate > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Award className="w-4 h-4 text-green-400" />
                        {profile.success_rate.toFixed(0)}% успешных
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            {profile.bio && (
              <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">О себе</h2>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Навыки</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((ps) => (
                    <span
                      key={ps.skill_id}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300"
                    >
                      {ps.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Портфолио</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {portfolio.map((item) => (
                    <Link
                      key={item.id}
                      href={`/portfolio/${item.id}`}
                      className="border border-slate-700 rounded-xl p-4 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-600 transition-colors block group"
                    >
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                      )}
                      <span className="text-xs text-primary mt-2 block">Подробнее →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Отзывы ({reviews.length})</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-border/50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.score ? 'fill-current' : 'text-slate-600'}`} />
                          ))}
                        </div>
                      </div>
                      {review.text && (
                        <p className="text-sm text-slate-300">{review.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6 self-start sticky top-24">

            {/* Hire Card */}
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
              {profile.hourly_rate && (
                <div className="mb-6">
                  <p className="text-sm text-slate-400 mb-1">Ставка</p>
                  <div className="flex items-baseline gap-1">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold text-white">{profile.hourly_rate}</span>
                    <span className="text-slate-400 text-sm">/час</span>
                  </div>
                </div>
              )}

              <Link
                href="/projects"
                className="w-full block text-center py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] mb-3"
              >
                Пригласить на проект
              </Link>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Написать сообщение
              </button>
            </div>

            {/* Stats */}
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Статистика</h3>
              <div className="space-y-4 text-sm">
                {profile.review_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Рейтинг</span>
                    <span className="text-white font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {profile.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Проектов завершено</span>
                  <span className="text-white font-bold">{profile.completed_count}</span>
                </div>
                {profile.total_earned > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Заработано</span>
                    <span className="text-white font-bold">${profile.total_earned.toLocaleString('en-US')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">На платформе с</span>
                  <span className="text-white font-medium">{monthYear(profile.created_at)}</span>
                </div>
                {profile.is_verified && (
                  <div className="flex items-center gap-2 text-emerald-400 pt-2 border-t border-slate-border/50">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Верифицирован</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
