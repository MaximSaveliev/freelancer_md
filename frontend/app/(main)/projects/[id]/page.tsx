'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Star, Clock, CheckCircle2, 
  MessageSquare, User, ShieldCheck, AlertCircle, X, Gavel, Bookmark, Share2, Flag, Users, Info, Crown, Zap
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SubscriptionModal from '@/components/subscription-modal';

// Mock data for projects (in a real app, this would be fetched from an API)
const MOCK_PROJECTS = [
  {
    id: '7',
    title: 'Создание 3D-модели для игры',
    postedAt: '10 часов назад',
    applicants: 2,
    paymentVerified: false,
    description: 'Требуется создать 3D-модель персонажа (low-poly) для инди-игры. Нужен риггинг и базовая анимация ходьбы/бега. Модель должна быть оптимизирована для мобильных устройств (до 5000 полигонов). Текстуры в стиле hand-painted. Референсы предоставлю выбранному исполнителю.',
    tags: ['3D Modeling', 'Blender', 'Animation'],
    budget: 'Аукцион',
    budgetMin: 500,
    budgetMax: 1400,
    rating: 0,
    reviews: 0,
    isSaved: false,
    isPromoted: false,
    categoryId: 'design',
    paymentType: 'auction',
    deadline: 'long',
    experienceLevel: 'junior',
    isEscrowReady: false,
    isNew: true,
    isAuction: true,
    client: {
      name: 'IndieGames Studio',
      avatar: 'https://picsum.photos/seed/client7/100/100',
      registeredAt: 'Сентябрь 2023',
      totalSpent: '$1,200',
      location: 'Казахстан'
    }
  },
  {
    id: '8',
    title: 'Разработка логотипа для крипто-стартапа',
    postedAt: '1 час назад',
    applicants: 5,
    paymentVerified: true,
    description: 'Нам нужен современный, минималистичный логотип для нового DeFi проекта. Логотип должен ассоциироваться с безопасностью, скоростью и инновациями. Ожидаем 3-4 концепта на выбор. Итоговые файлы нужны в векторном формате (AI, EPS, SVG) и растре (PNG с прозрачным фоном).',
    tags: ['Logo Design', 'Branding', 'Illustrator'],
    budget: 'Аукцион',
    budgetMin: 200,
    budgetMax: 500,
    rating: 4.8,
    reviews: 12,
    isSaved: false,
    isPromoted: true,
    categoryId: 'design',
    paymentType: 'auction',
    deadline: 'short',
    experienceLevel: 'middle',
    isEscrowReady: true,
    isNew: true,
    isAuction: true,
    client: {
      name: 'CryptoNext',
      avatar: 'https://picsum.photos/seed/client8/100/100',
      registeredAt: 'Январь 2022',
      totalSpent: '$15,400',
      location: 'США'
    }
  },
  {
    id: '9',
    title: 'Настройка таргетированной рекламы Facebook/Insta',
    postedAt: '5 часов назад',
    applicants: 12,
    paymentVerified: true,
    description: 'Нужен специалист для настройки и ведения рекламной кампании для интернет-магазина одежды. Цель: ROAS > 300%. Бюджет на рекламу $2000/мес. Оплата за настройку и ведение обсуждается на аукционе. Обязателен опыт работы с e-commerce и наличие успешных кейсов.',
    tags: ['Targeted Ads', 'Facebook Ads', 'Marketing'],
    budget: 'Аукцион',
    budgetMin: 300,
    budgetMax: 800,
    rating: 5.0,
    reviews: 45,
    isSaved: true,
    isPromoted: false,
    categoryId: 'marketing',
    paymentType: 'auction',
    deadline: 'long',
    experienceLevel: 'senior',
    isEscrowReady: true,
    isNew: false,
    isAuction: true,
    client: {
      name: 'FashionStore',
      avatar: 'https://picsum.photos/seed/client9/100/100',
      registeredAt: 'Март 2021',
      totalSpent: '$45,000',
      location: 'Украина'
    }
  }
];

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const [auctionBid, setAuctionBid] = useState('');
  const [auctionTimeframe, setAuctionTimeframe] = useState('1');
  const [auctionCoverLetter, setAuctionCoverLetter] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    const plan = localStorage.getItem('userPlan') as 'free' | 'pro' | 'premium' | null;
    if (plan) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserPlan(plan);
    }

    // Simulate API fetch
    const foundProject = MOCK_PROJECTS.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
    } else {
      // Fallback for projects not in our specific mock list
      setProject({
        id: projectId,
        title: 'Пример проекта',
        postedAt: 'Только что',
        applicants: 0,
        paymentVerified: true,
        description: 'Описание проекта не найдено. Это демонстрационная страница.',
        tags: ['Example'],
        budget: '$100',
        rating: 5.0,
        reviews: 1,
        isAuction: false,
        client: {
          name: 'Demo Client',
          avatar: 'https://picsum.photos/seed/demo/100/100',
          registeredAt: 'Сегодня',
          totalSpent: '$0',
          location: 'Неизвестно'
        }
      });
    }
  }, [projectId]);

  const handleAuctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBid(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmittingBid(false);
      setBidSuccess(true);
      setTimeout(() => {
        setIsAuctionModalOpen(false);
        setBidSuccess(false);
        setAuctionBid('');
        setAuctionTimeframe('1');
        setAuctionCoverLetter('');
      }, 2000);
    }, 1500);
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
                  {project.isAuction && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-500/20 text-purple-400 text-sm font-medium border border-purple-500/30">
                      <Gavel className="w-4 h-4" />
                      Аукцион
                    </span>
                  )}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-8 pb-6 border-b border-slate-border/50">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Опубликовано {project.postedAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {project.applicants} откликов
                </span>
              </div>

              <div className="prose prose-invert max-w-none mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Описание задачи</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Навыки</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6 sticky top-28">
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-2">Бюджет</p>
                {project.isAuction ? (
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">Аукцион</div>
                    <p className="text-sm text-slate-400">
                      Ожидаемый: <span className="text-white font-medium">${project.budgetMin} - ${project.budgetMax}</span>
                    </p>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white">{project.budget}</div>
                )}
              </div>

              {project.isAuction ? (
                <button 
                  onClick={() => setIsAuctionModalOpen(true)}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2 mb-4"
                >
                  <Gavel className="w-5 h-5" />
                  Сделать предложение
                </button>
              ) : (
                <button className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] mb-4">
                  Откликнуться на проект
                </button>
              )}

              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Сохранить
                </button>
                <button className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Поделиться
                </button>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">О заказчике</h3>
              
              <div className="flex items-start gap-4 mb-6">
                <Image 
                  src={project.client.avatar} 
                  alt={project.client.name} 
                  width={56} 
                  height={56} 
                  className="rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{project.client.name}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-medium text-white">{project.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-500">({project.reviews} отзывов)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-4 border-b border-slate-border/50">
                  <span className="text-slate-400">На платформе с</span>
                  <span className="text-white font-medium">{project.client.registeredAt}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-border/50">
                  <span className="text-slate-400">Всего потрачено</span>
                  <span className="text-white font-medium">{project.client.totalSpent}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-border/50">
                  <span className="text-slate-400">Локация</span>
                  <span className="text-white font-medium">{project.client.location}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {project.paymentVerified ? (
                    <span className="flex items-center gap-2 text-emerald-400 font-medium">
                      <ShieldCheck className="w-5 h-5" />
                      Оплата верифицирована
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-slate-500 font-medium">
                      <ShieldCheck className="w-5 h-5" />
                      Оплата не верифицирована
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Auction Modal */}
      <AnimatePresence>
        {isAuctionModalOpen && project.isAuction && (
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
                    <p className="text-sm text-slate-400">Аукцион: {project.title}</p>
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
                    
                    <div className="bg-slate-800/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-700/50">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Ожидаемый бюджет</p>
                        <p className="text-lg font-bold text-white">${project.budgetMin} - ${project.budgetMax}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-sm text-slate-400 mb-1">Конкуренция</p>
                        <p className="text-sm font-medium text-white flex items-center gap-1.5 sm:justify-end">
                          <Users className="w-4 h-4 text-primary" />
                          Подано {project.applicants} заявок
                        </p>
                      </div>
                    </div>

                    {/* Premium Bid Insights */}
                    {userPlan === 'premium' ? (
                      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                        <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-400 mb-1">Premium Insights</p>
                          <p className="text-sm text-slate-300">
                            Средняя предложенная цена по этому проекту: <span className="font-bold text-white">${Math.round((project.budgetMin + project.budgetMax) / 2.2)}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white mb-1">Скрытые ставки</p>
                            <p className="text-xs text-slate-400">
                              Хотите видеть среднюю предложенную цену конкурентов?
                            </p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsSubscriptionModalOpen(true)}
                          className="shrink-0 text-xs font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Crown className="w-3 h-3" /> Premium
                        </button>
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
                            placeholder="Например, 800"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Срок (дней)</label>
                        <div className="relative">
                          <select
                            required
                            value={auctionTimeframe}
                            onChange={(e) => setAuctionTimeframe(e.target.value)}
                            className="w-full bg-background-dark border border-slate-border rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                          >
                            {[...Array(14)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'день' : (i > 0 && i < 4) ? 'дня' : 'дней'}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
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
                      <div className="flex-1">
                        <p className="text-xs text-slate-300 leading-relaxed mb-2">
                          Ваша ставка скрыта от других фрилансеров. Заказчик увидит ваше предложение и сможет выбрать вас в качестве исполнителя.
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-blue-500/20">
                          <span className="text-xs text-slate-400">
                            Осталось откликов: <span className="font-bold text-white">{userPlan === 'free' ? '2/2' : '5/5'}</span>
                          </span>
                          {userPlan === 'free' && (
                            <button 
                              type="button"
                              onClick={() => setIsSubscriptionModalOpen(true)}
                              className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
                            >
                              Увеличить лимит
                            </button>
                          )}
                        </div>
                      </div>
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
