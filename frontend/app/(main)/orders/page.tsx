'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MessageSquare, CheckCircle2, ShieldCheck, FileText, ExternalLink, AlertCircle, Info, Wallet } from 'lucide-react';
import Link from 'next/link';
import { listUserBids, getProject } from '@/lib/api/bl';
import type { Bid, Project } from '@/lib/types';

type Tab = 'active' | 'bids' | 'completed' | 'offers';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (hours < 1) return 'Только что';
  if (hours < 24) return `${hours} ч. назад`;
  if (days === 1) return 'Вчера';
  return `${days} дн. назад`;
}

interface BidWithProject extends Bid {
  project: Project | null;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [now, setNow] = useState(new Date());
  const [allBids, setAllBids] = useState<BidWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) { setLoading(false); return; }

    listUserBids(userId)
      .then(async (bids) => {
        const uniqueProjectIds = [...new Set(bids.map(b => b.project_id))];
        const projects = await Promise.all(
          uniqueProjectIds.map(id => getProject(id).catch(() => null))
        );
        const projectMap = new Map(uniqueProjectIds.map((id, i) => [id, projects[i]]));
        setAllBids(bids.map(b => ({ ...b, project: projectMap.get(b.project_id) ?? null })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatTimeLeft = (deadline: Date) => {
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return { text: 'Срок истек', isUrgent: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const isUrgent = days === 0;
    if (days > 0) return { text: `До сдачи: ${days} дн. ${hours} ч.`, isUrgent };
    return { text: `До сдачи: ${hours} ч.`, isUrgent };
  };

  const activeBids = allBids.filter(b => b.status === 'ACCEPTED' && b.project?.status === 'IN_PROGRESS');
  const pendingBids = allBids.filter(b => b.status === 'PENDING');
  const completedBids = allBids.filter(b => b.status === 'ACCEPTED' && b.project?.status === 'COMPLETED');

  const totalFrozen = activeBids.reduce((sum, b) => sum + b.amount, 0);
  const totalEarned = completedBids.reduce((sum, b) => sum + b.amount, 0);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Мои заказы</h1>
          <p className="text-slate-400">Управляйте текущими контрактами, откликами и историей работ.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Content */}
          <div className="flex-1">

            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-border mb-6">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                В работе ({activeBids.length})
              </button>
              <button
                onClick={() => setActiveTab('bids')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'bids' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Мои отклики ({pendingBids.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Завершенные ({completedBids.length})
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'offers' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Предложения
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >

                {/* ACTIVE ORDERS */}
                {activeTab === 'active' && (
                  activeBids.length === 0 ? (
                    <div className="bg-slate-card border border-slate-border rounded-2xl p-12 text-center">
                      <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">У вас нет активных заказов</h3>
                      <p className="text-slate-400 mb-6">Найдите подходящий проект и сделайте первый отклик.</p>
                      <Link href="/projects" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors">
                        Найти проекты
                      </Link>
                    </div>
                  ) : (
                    activeBids.map((bid) => {
                      const deadline = new Date(new Date(bid.created_at).getTime() + bid.delivery_days * 86_400_000);
                      const { text: timeLeftText, isUrgent } = formatTimeLeft(deadline);
                      return (
                        <div key={bid.id} className="bg-slate-card border border-slate-border rounded-2xl p-6 hover:border-slate-700 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <div className="flex-1">
                              <Link href={`/projects/${bid.project_id}`} className="group inline-flex items-start gap-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight">
                                  {bid.project?.title || 'Проект'}
                                </h3>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-primary shrink-0 mt-1" />
                              </Link>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                              <div className="text-xl font-bold text-white">
                                ${bid.amount.toLocaleString('en-US')}
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                В работе
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-border/50">
                            <div className={`flex items-center gap-2 text-sm font-medium ${isUrgent ? 'text-orange-400' : 'text-slate-300'}`}>
                              {isUrgent ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              {timeLeftText}
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <Link
                                href="/messages"
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Написать заказчику
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )
                )}

                {/* BIDS */}
                {activeTab === 'bids' && (
                  pendingBids.length === 0 ? (
                    <div className="bg-slate-card border border-slate-border rounded-2xl p-12 text-center">
                      <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">У вас нет активных откликов</h3>
                      <p className="text-slate-400 mb-6">Откликайтесь на проекты, чтобы начать работу.</p>
                      <Link href="/projects" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors">
                        Найти проекты
                      </Link>
                    </div>
                  ) : (
                    pendingBids.map((bid) => (
                      <div key={bid.id} className="bg-slate-card border border-slate-border rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2">
                              {bid.project?.title || 'Проект'}
                            </h3>
                            {bid.cover_letter && (
                              <p className="text-sm text-slate-400 line-clamp-2">{bid.cover_letter}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-1">
                            <span className="text-sm text-slate-400">Ваша ставка:</span>
                            <span className="text-lg font-bold text-white">${bid.amount.toLocaleString('en-US')}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-border/50">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock className="w-4 h-4" />
                            Отклик отправлен {timeAgo(bid.created_at)}
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                            На рассмотрении
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* COMPLETED */}
                {activeTab === 'completed' && (
                  completedBids.length === 0 ? (
                    <div className="bg-slate-card border border-slate-border rounded-2xl p-12 text-center">
                      <CheckCircle2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">Нет завершённых заказов</h3>
                      <p className="text-slate-400">Завершённые проекты появятся здесь.</p>
                    </div>
                  ) : (
                    completedBids.map((bid) => (
                      <div key={bid.id} className="bg-slate-card border border-slate-border rounded-2xl p-6 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2">{bid.project?.title || 'Проект'}</h3>
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-1">
                            <span className="text-lg font-bold text-white">${bid.amount.toLocaleString('en-US')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-border/50 text-sm text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Завершен {timeAgo(bid.updated_at)}
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* OFFERS */}
                {activeTab === 'offers' && (
                  <div className="bg-slate-card border border-slate-border rounded-2xl p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">У вас пока нет персональных предложений</h3>
                    <p className="text-slate-400">Компании могут отправлять вам предложения напрямую, если им понравится ваше портфолио.</p>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6 sticky top-28">
              <h2 className="text-xl font-bold text-white mb-6">Сводка</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-base font-medium">В работе</span>
                  </div>
                  <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                    <span className="text-xl text-slate-500 font-semibold">$</span>
                    {totalFrozen.toLocaleString('en-US')}
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Сумма по активным проектам</p>
                </div>

                <div className="w-full h-px bg-slate-border/50"></div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-base font-medium">Заработано за всё время</span>
                  </div>
                  <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                    <span className="text-xl text-slate-500 font-semibold">$</span>
                    {totalEarned.toLocaleString('en-US')}
                  </div>
                </div>

                <div className="w-full h-px bg-slate-border/50"></div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <Wallet className="w-5 h-5 text-primary" />
                    <span className="text-base font-medium">Всего откликов</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {allBids.length}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-5 bg-[#1A272D]/40 border border-[#23353D] rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#00B2FF] shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Здесь отображаются ваши активные контракты и отклики на проекты.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
