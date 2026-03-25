'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Star, Clock, CheckCircle2,
  MessageSquare, User, ShieldCheck, AlertCircle, X, Gavel, Bookmark, Share2, Users, Info, Crown
} from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { useParams } from 'next/navigation';
import SubscriptionModal from '@/components/subscription-modal';
import { getProject, getProfile, createBid, addBookmark, removeBookmark } from '@/lib/api/bl';
import type { Project, Profile, ProjectBudget } from '@/lib/types';

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

function monthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [clientProfile, setClientProfile] = useState<Profile | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const [auctionBid, setAuctionBid] = useState('');
  const [auctionTimeframe, setAuctionTimeframe] = useState('7');
  const [auctionCoverLetter, setAuctionCoverLetter] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidError, setBidError] = useState('');
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    const plan = localStorage.getItem('userPlan') as 'free' | 'pro' | 'premium' | null;
    if (plan) setUserPlan(plan);
    setUserId(localStorage.getItem('user_id'));

    getProject(projectId, plan || 'free')
      .then(p => {
        setProject(p);
        return getProfile(p.user_id);
      })
      .then(setClientProfile)
      .catch(() => {});
  }, [projectId]);

  const handleAuctionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmittingBid(true);
    setBidError('');
    try {
      await createBid(projectId, {
        user_id: userId,
        amount: parseInt(auctionBid),
        delivery_days: parseInt(auctionTimeframe),
        cover_letter: auctionCoverLetter,
      });
      setBidSuccess(true);
      setTimeout(() => {
        setIsAuctionModalOpen(false);
        setBidSuccess(false);
        setAuctionBid('');
        setAuctionTimeframe('7');
        setAuctionCoverLetter('');
      }, 2000);
    } catch (err: any) {
      setBidError(err.message || 'Ошибка при отправке предложения');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!userId) return;
    try {
      if (isSaved) {
        await removeBookmark(projectId, userId);
      } else {
        await addBookmark(projectId, userId);
      }
      setIsSaved(prev => !prev);
    } catch {
      // ignore
    }
  };

  const handleUpgrade = (plan: 'pro' | 'premium') => {
    setUserPlan(plan);
    localStorage.setItem('userPlan', plan);
  };

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAuction = project.payment_type === 'AUCTION';
  const isOwner = userId === project.user_id;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Back button */}
        <Link href="/projects" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Назад к поиску
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Project Header */}
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6 md:p-8">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 flex-wrap">
                  {project.title}
                  {isAuction && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-500/20 text-purple-400 text-sm font-medium border border-purple-500/30">
                      <Gavel className="w-4 h-4" />
                      Аукцион
                    </span>
                  )}
                  {project.is_urgent && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-orange-500/20 text-orange-400 text-sm font-medium border border-orange-500/30">
                      <AlertCircle className="w-4 h-4" />
                      Срочно
                    </span>
                  )}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-8 pb-6 border-b border-slate-border/50">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Опубликовано {timeAgo(project.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {project.bid_count} откликов
                </span>
                {project.status !== 'OPEN' && (
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-md">
                    {project.status}
                  </span>
                )}
              </div>

              <div className="prose prose-invert max-w-none mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Описание задачи</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {project.required_grade && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4">Требуемый уровень</h3>
                  <span className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-300">
                    {project.required_grade}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Action Card */}
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6 sticky top-28">
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-2">Бюджет</p>
                {isAuction && project.budget ? (
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">Аукцион</div>
                    {project.budget.min != null && project.budget.max != null && (
                      <p className="text-sm text-slate-400">
                        Ожидаемый: <span className="text-white font-medium">${project.budget.min} – ${project.budget.max}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white">{formatBudget(project.budget)}</div>
                )}
              </div>

              {!isOwner && project.status === 'OPEN' && (
                isAuction ? (
                  <button
                    onClick={() => setIsAuctionModalOpen(true)}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2 mb-4"
                  >
                    <Gavel className="w-5 h-5" />
                    Сделать предложение
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuctionModalOpen(true)}
                    className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] mb-4"
                  >
                    Откликнуться на проект
                  </button>
                )
              )}

              {isOwner && (
                <Link
                  href={`/manage-project/${project.id}`}
                  className="w-full block text-center py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors mb-4"
                >
                  Управлять проектом
                </Link>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleBookmarkToggle}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isSaved ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Сохранено' : 'Сохранить'}
                </button>
                <button className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Поделиться
                </button>
              </div>
            </div>

            {/* Client Info */}
            {clientProfile && (
              <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">О заказчике</h3>

                <div className="flex items-start gap-4 mb-6">
                  <Avatar
                    src={clientProfile.avatar_url ?? null}
                    name={clientProfile.company_name || `${clientProfile.first_name} ${clientProfile.last_name}`}
                    size={56}
                  />
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">
                      {clientProfile.company_name || `${clientProfile.first_name} ${clientProfile.last_name}`}
                    </h4>
                    {clientProfile.review_count > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-medium text-white">{clientProfile.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-slate-500">({clientProfile.review_count} отзывов)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-border/50">
                    <span className="text-slate-400">На платформе с</span>
                    <span className="text-white font-medium">{monthYear(clientProfile.created_at)}</span>
                  </div>
                  {clientProfile.location && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-border/50">
                      <span className="text-slate-400">Локация</span>
                      <span className="text-white font-medium">{clientProfile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    {clientProfile.is_verified ? (
                      <span className="flex items-center gap-2 text-emerald-400 font-medium">
                        <ShieldCheck className="w-5 h-5" />
                        Верифицирован
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-slate-500 font-medium">
                        <ShieldCheck className="w-5 h-5" />
                        Не верифицирован
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <AnimatePresence>
        {isAuctionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
              onClick={() => !isSubmittingBid && setIsAuctionModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-card border border-slate-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-border/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Gavel className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Сделать предложение</h3>
                    <p className="text-sm text-slate-400">{project.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => !isSubmittingBid && setIsAuctionModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {bidSuccess ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Предложение отправлено!</h4>
                    <p className="text-slate-400">Заказчик получит уведомление о вашей ставке.</p>
                  </div>
                ) : (
                  <form onSubmit={handleAuctionSubmit} className="space-y-6">

                    <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between gap-4 border border-slate-700/50">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Бюджет проекта</p>
                        <p className="text-lg font-bold text-white">{formatBudget(project.budget)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400 mb-1">Откликов</p>
                        <p className="text-sm font-medium text-white flex items-center gap-1.5 justify-end">
                          <Users className="w-4 h-4 text-primary" />
                          {project.bid_count}
                        </p>
                      </div>
                    </div>

                    {userPlan === 'premium' && project.avg_bid != null && (
                      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                        <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-400 mb-1">Premium Insights</p>
                          <p className="text-sm text-slate-300">
                            Средняя предложенная цена: <span className="font-bold text-white">${project.avg_bid}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {bidError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                        {bidError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Моя цена ($)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                          <input
                            type="number"
                            required
                            min="1"
                            value={auctionBid}
                            onChange={(e) => setAuctionBid(e.target.value)}
                            className="w-full bg-background-dark border border-slate-border rounded-xl py-3 pl-8 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            placeholder="500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Срок (дней)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="365"
                          value={auctionTimeframe}
                          onChange={(e) => setAuctionTimeframe(e.target.value)}
                          className="w-full bg-background-dark border border-slate-border rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          placeholder="7"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Сопроводительное письмо</label>
                      <textarea
                        required
                        value={auctionCoverLetter}
                        onChange={(e) => setAuctionCoverLetter(e.target.value)}
                        className="w-full bg-background-dark border border-slate-border rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[120px] resize-y"
                        placeholder="Опишите ваш опыт и почему вы отлично подходите для этой задачи..."
                      />
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Ваша ставка скрыта от других фрилансеров. Заказчик увидит ваше предложение и сможет выбрать вас.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingBid || !auctionBid || !auctionTimeframe || !auctionCoverLetter}
                      className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmittingBid ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Отправка...
                        </>
                      ) : (
                        'Отправить предложение'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentPlan={userPlan}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
