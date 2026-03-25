'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Star, Clock, CheckCircle2,
  MessageSquare, User, ShieldCheck, X, Gavel, Info
} from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { useParams } from 'next/navigation';
import { getProject, listBids, getProfile, updateBidStatus } from '@/lib/api/bl';
import type { Project, Bid, Profile, ProjectBudget } from '@/lib/types';

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

interface BidWithProfile extends Bid {
  profile: Profile | null;
}

export default function ManageProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<BidWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<BidWithProfile | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('user_id');
    setUserId(uid);

    Promise.all([
      getProject(projectId),
      listBids(projectId),
    ])
      .then(async ([proj, rawBids]) => {
        setProject(proj);
        // Load profiles for all unique bidders in parallel
        const uniqueUserIds = [...new Set(rawBids.map(b => b.user_id))];
        const profiles = await Promise.all(
          uniqueUserIds.map(id => getProfile(id).catch(() => null))
        );
        const profileMap = new Map(uniqueUserIds.map((id, i) => [id, profiles[i]]));
        setBids(rawBids.map(b => ({ ...b, profile: profileMap.get(b.user_id) ?? null })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleAcceptBid = async (bidId: string) => {
    if (!userId) return;
    setIsAccepting(true);
    try {
      await updateBidStatus(projectId, bidId, userId, 'ACCEPTED');
      // Reject all other pending bids
      const others = bids.filter(b => b.id !== bidId && b.status === 'PENDING');
      await Promise.all(others.map(b => updateBidStatus(projectId, b.id, userId, 'REJECTED').catch(() => {})));
      setBids(prev => prev.map(bid => ({
        ...bid,
        status: bid.id === bidId ? 'ACCEPTED' : bid.status === 'PENDING' ? 'REJECTED' : bid.status,
      })));
      setSelectedBid(null);
      setShowSuccessModal(true);
    } catch {
      // ignore
    } finally {
      setIsAccepting(false);
    }
  };

  const hasAcceptedBid = bids.some(b => b.status === 'ACCEPTED');

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link href="/client-profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Назад к профилю
          </Link>

          {project && (
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium border border-purple-500/20 mb-4">
                    <Gavel className="w-4 h-4" />
                    {project.payment_type}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">{project.title}</h1>
                  <p className="text-slate-300 mb-6 max-w-3xl">{project.description}</p>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Опубликовано {timeAgo(project.created_at)}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {bids.length} заявок
                    </div>
                  </div>
                </div>

                <div className="shrink-0 bg-slate-800/50 rounded-xl p-5 border border-slate-700 min-w-[200px]">
                  <p className="text-sm text-slate-400 mb-1">Бюджет</p>
                  <p className="text-2xl font-bold text-white">{formatBudget(project.budget)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bids Table */}
        <div className="bg-slate-card border border-slate-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-border/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Предложения фрилансеров</h2>
            {hasAcceptedBid && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Исполнитель выбран
              </span>
            )}
          </div>

          {bids.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Пока нет предложений от фрилансеров.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/30 border-b border-slate-border/50 text-sm text-slate-400">
                    <th className="p-6 font-medium">Фрилансер</th>
                    <th className="p-6 font-medium">Предложение</th>
                    <th className="p-6 font-medium">Срок</th>
                    <th className="p-6 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-border/50">
                  {bids.map((bid) => (
                    <tr
                      key={bid.id}
                      className={`transition-colors hover:bg-slate-800/20 ${
                        bid.status === 'ACCEPTED' ? 'bg-emerald-500/5 hover:bg-emerald-500/10' :
                        bid.status === 'REJECTED' ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="p-6 align-top">
                        <div className="flex items-start gap-4">
                          <Avatar
                            src={bid.profile?.avatar_url ?? null}
                            name={bid.profile ? `${bid.profile.first_name} ${bid.profile.last_name}` : 'Freelancer'}
                            size={48}
                          />
                          <div>
                            <h3 className="text-base font-bold text-white mb-1">
                              {bid.profile ? `${bid.profile.first_name} ${bid.profile.last_name}` : 'Фрилансер'}
                            </h3>
                            <div className="flex items-center gap-3 text-sm">
                              {bid.profile?.grade && (
                                <span className="text-primary font-medium">{bid.profile.grade}</span>
                              )}
                              {bid.profile && bid.profile.review_count > 0 && (
                                <div className="flex items-center gap-1 text-slate-300">
                                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                  {bid.profile.rating.toFixed(1)}
                                  <span className="text-slate-500">({bid.profile.review_count})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-white">${bid.amount.toLocaleString('en-US')}</span>
                        </div>
                        {bid.cover_letter && (
                          <p className="text-sm text-slate-400 line-clamp-2 max-w-md" title={bid.cover_letter}>
                            &quot;{bid.cover_letter}&quot;
                          </p>
                        )}
                      </td>
                      <td className="p-6 align-top">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Clock className="w-4 h-4 text-slate-500" />
                          {bid.delivery_days} дней
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          {timeAgo(bid.created_at)}
                        </div>
                      </td>
                      <td className="p-6 align-top text-right">
                        <div className="flex flex-col items-end gap-2">
                          {bid.status === 'PENDING' && !hasAcceptedBid && (
                            <button
                              onClick={() => setSelectedBid(bid)}
                              className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)]"
                            >
                              Выбрать исполнителя
                            </button>
                          )}
                          {bid.status === 'ACCEPTED' && (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium px-4 py-2">
                              <CheckCircle2 className="w-5 h-5" />
                              Выбран
                            </span>
                          )}
                          {bid.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-medium px-4 py-2">
                              <X className="w-5 h-5" />
                              Отклонен
                            </span>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <Link
                              href={`/freelancers/${bid.user_id}`}
                              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                              <User className="w-4 h-4" />
                              Профиль
                            </Link>
                            <button className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4" />
                              Чат
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Accept Bid Modal */}
      <AnimatePresence>
        {selectedBid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
              onClick={() => !isAccepting && setSelectedBid(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-card border border-slate-border rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Подтверждение выбора</h3>
                  <p className="text-sm text-slate-400">
                    Исполнитель: {selectedBid.profile ? `${selectedBid.profile.first_name} ${selectedBid.profile.last_name}` : 'Фрилансер'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Сумма:</span>
                  <span className="text-lg font-bold text-white">${selectedBid.amount.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-700 pt-3">
                  <span className="text-slate-400">Срок выполнения:</span>
                  <span className="text-white font-medium">{selectedBid.delivery_days} дней</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Нажимая «Подтвердить», вы выбираете этого исполнителя. Остальные кандидаты получат уведомление об отказе.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedBid(null)}
                  disabled={isAccepting}
                  className="flex-1 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleAcceptBid(selectedBid.id)}
                  disabled={isAccepting}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isAccepting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Подтвердить'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
              onClick={() => setShowSuccessModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-card border border-slate-border rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Исполнитель выбран!</h3>
              <p className="text-slate-300 mb-6">
                Фрилансер уведомлен и готов приступить к работе. Остальным кандидатам отправлен отказ.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
              >
                Отлично
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
