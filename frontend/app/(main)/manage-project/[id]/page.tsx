'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Star, Clock, CheckCircle2, 
  MessageSquare, User, ShieldCheck, AlertCircle, X, Gavel, Info
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const MOCK_PROJECT = {
  id: '7',
  title: 'Создание 3D-модели для игры',
  status: 'auction',
  budgetRange: '$500 - $1400',
  description: 'Требуется создать 3D-модель персонажа (low-poly) для инди-игры. Нужен риггинг и базовая анимация ходьбы/бега.',
  postedAt: '10 часов назад',
};

const MOCK_BIDS = [
  {
    id: 'b1',
    freelancer: {
      name: 'Иван Петров',
      avatar: 'https://picsum.photos/seed/ivan/150/150',
      rating: 4.9,
      reviews: 42,
      level: 'Senior',
    },
    price: 1200,
    timeframe: 7,
    coverLetter: 'Привет! У меня большой опыт в low-poly моделировании и риггинге. Работал над 3 инди-играми. Готов приступить завтра.',
    submittedAt: '2 часа назад',
    status: 'pending', // pending, accepted, rejected
  },
  {
    id: 'b2',
    freelancer: {
      name: 'Анна Смирнова',
      avatar: 'https://picsum.photos/seed/anna/150/150',
      rating: 5.0,
      reviews: 18,
      level: 'Middle',
    },
    price: 850,
    timeframe: 5,
    coverLetter: 'Здравствуйте. Обожаю инди-игры! Сделаю качественную модель с анимацией бега и ходьбы. Могу скинуть примеры похожих работ в чат.',
    submittedAt: '5 часов назад',
    status: 'pending',
  },
  {
    id: 'b3',
    freelancer: {
      name: 'Алексей В.',
      avatar: 'https://picsum.photos/seed/alex/150/150',
      rating: 4.5,
      reviews: 8,
      level: 'Junior',
    },
    price: 500,
    timeframe: 10,
    coverLetter: 'Готов взяться за проект. Сделаю всё по ТЗ.',
    submittedAt: '8 часов назад',
    status: 'pending',
  }
];

export default function ManageProjectPage() {
  const params = useParams();
  const [bids, setBids] = useState(MOCK_BIDS);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleAcceptBid = (bidId: string) => {
    setIsAccepting(true);
    // Simulate API call to accept bid, freeze funds, and notify others
    setTimeout(() => {
      setBids(prev => prev.map(bid => ({
        ...bid,
        status: bid.id === bidId ? 'accepted' : 'rejected'
      })));
      setIsAccepting(false);
      setSelectedBid(null);
      setShowSuccessModal(true);
    }, 1500);
  };

  const hasAcceptedBid = bids.some(b => b.status === 'accepted');

  return (
    <div className="min-h-screen bg-background-dark pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/client-profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Назад к профилю
          </Link>
          
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium border border-purple-500/20 mb-4">
                  <Gavel className="w-4 h-4" />
                  Аукцион
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">{MOCK_PROJECT.title}</h1>
                <p className="text-slate-300 mb-6 max-w-3xl">{MOCK_PROJECT.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Опубликовано {MOCK_PROJECT.postedAt}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {bids.length} заявок
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 bg-slate-800/50 rounded-xl p-5 border border-slate-700 min-w-[200px]">
                <p className="text-sm text-slate-400 mb-1">Ожидаемый бюджет</p>
                <p className="text-2xl font-bold text-white">{MOCK_PROJECT.budgetRange}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Table */}
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
                      bid.status === 'accepted' ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 
                      bid.status === 'rejected' ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-6 align-top">
                      <div className="flex items-start gap-4">
                        <Image 
                          src={bid.freelancer.avatar} 
                          alt={bid.freelancer.name} 
                          width={48} 
                          height={48} 
                          className="rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h3 className="text-base font-bold text-white mb-1">{bid.freelancer.name}</h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-primary font-medium">{bid.freelancer.level}</span>
                            <div className="flex items-center gap-1 text-slate-300">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              {bid.freelancer.rating} <span className="text-slate-500">({bid.freelancer.reviews})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 align-top">
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-white">${bid.price.toLocaleString('en-US')}</span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 max-w-md" title={bid.coverLetter}>
                        &quot;{bid.coverLetter}&quot;
                      </p>
                    </td>
                    <td className="p-6 align-top">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {bid.timeframe} дней
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {bid.submittedAt}
                      </div>
                    </td>
                    <td className="p-6 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        {bid.status === 'pending' && !hasAcceptedBid && (
                          <button 
                            onClick={() => setSelectedBid(bid)}
                            className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)]"
                          >
                            Выбрать исполнителя
                          </button>
                        )}
                        {bid.status === 'accepted' && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium px-4 py-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Выбран
                          </span>
                        )}
                        {bid.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-slate-500 font-medium px-4 py-2">
                            <X className="w-5 h-5" />
                            Отклонен
                          </span>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <button className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            Профиль
                          </button>
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
                  <p className="text-sm text-slate-400">Вы выбираете исполнителя {selectedBid.freelancer.name}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Сумма к заморозке:</span>
                  <span className="text-lg font-bold text-white">${selectedBid.price.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-700 pt-3">
                  <span className="text-slate-400">Срок выполнения:</span>
                  <span className="text-white font-medium">{selectedBid.timeframe} дней</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Нажимая «Подтвердить», вы соглашаетесь заморозить сумму ${selectedBid.price.toLocaleString('en-US')} на счету Эскроу. Остальные кандидаты получат вежливое уведомление об отказе.
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
                    <>Подтвердить</>
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
                Средства успешно заморожены в Эскроу. Фрилансер уведомлен и готов приступить к работе. Остальным кандидатам отправлен отказ.
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
