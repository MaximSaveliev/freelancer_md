'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MessageSquare, CheckCircle2, ShieldCheck, FileText, ExternalLink, AlertCircle, Info, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createOrGetConversation } from '@/lib/conversations';

const MOCK_ACTIVE_ORDERS = [
  {
    id: 1,
    title: 'Разработка интернет-магазина на Next.js',
    client: {
      name: 'Александр Ионеску',
      avatar: 'https://picsum.photos/seed/company/150/150',
    },
    price: 600,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 2 days 4 hours
    isEscrowReady: true,
  },
  {
    id: 2,
    title: 'Дизайн мобильного приложения для фитнеса',
    client: {
      name: 'Елена П.',
      avatar: 'https://picsum.photos/seed/elena/150/150',
    },
    price: 350,
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours (close)
    isEscrowReady: true,
  }
];

const MOCK_BIDS = [
  {
    id: 3,
    title: 'Лендинг для крипто-проекта',
    client: {
      name: 'Дмитрий С.',
      avatar: 'https://picsum.photos/seed/dmitry/150/150',
    },
    myBid: 250,
    status: 'На рассмотрении',
    dateApplied: '2 дня назад',
  },
  {
    id: 4,
    title: 'SEO оптимизация блога',
    client: {
      name: 'Анна В.',
      avatar: 'https://picsum.photos/seed/anna/150/150',
    },
    myBid: 150,
    status: 'На рассмотрении',
    dateApplied: 'Вчера',
  }
];

const MOCK_COMPLETED = [
  {
    id: 5,
    title: 'Редизайн корпоративного сайта',
    client: {
      name: 'ООО "ТехноСтрой"',
      avatar: 'https://picsum.photos/seed/tech/150/150',
    },
    price: 500,
    dateCompleted: '15 Фев 2026',
    rating: 5,
  },
  {
    id: 6,
    title: 'Настройка Яндекс.Директ',
    client: {
      name: 'ИП Смирнов',
      avatar: 'https://picsum.photos/seed/smirnov/150/150',
    },
    price: 200,
    dateCompleted: '28 Янв 2026',
    rating: 5,
  }
];

const MOCK_OFFERS = [
  {
    id: 7,
    title: 'Разработка мобильного приложения (React Native)',
    company: {
      name: 'TechCorp Solutions',
      avatar: 'https://picsum.photos/seed/techcorp/150/150',
    },
    price: 800,
    dateReceived: 'Сегодня',
    message: 'Здравствуйте! Нам очень понравилось ваше портфолио. Хотим предложить вам участие в разработке нашего нового продукта.',
  }
];

// Add Tab type
type Tab = 'active' | 'bids' | 'completed' | 'offers';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [now, setNow] = useState(new Date());

  // Update timer every minute
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return { text: 'Срок истек', isUrgent: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    const isUrgent = days === 0 && hours < 24;
    
    if (days > 0) {
      return { text: `До сдачи: ${days} дн. ${hours} ч.`, isUrgent };
    }
    return { text: `До сдачи: ${hours} ч.`, isUrgent };
  };

  const totalFrozen = MOCK_ACTIVE_ORDERS.reduce((sum, order) => sum + order.price, 0);
  const totalEarned = MOCK_COMPLETED.reduce((sum, order) => sum + order.price, 0);
  const availableToWithdraw = 450; // Mock value for available funds

  // Handler to open/create conversation and navigate to messages
  const handleWriteToClient = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    // Mock per requirement
    const user2Id = 18;

    try {
      // Ensure conversation exists (and validate auth) before going to messages.
      await createOrGetConversation(user2Id);
    } catch (err) {
      // Even if backend call fails (e.g. not logged in), still navigate to show the flow.
      console.warn('[Conversation] create-or-get failed, navigating anyway:', err);
    }

    router.push(`/messages?user2id=${user2Id}`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div className="space-y-8">
            {/* Tabs */}
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'active'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                В работе ({MOCK_ACTIVE_ORDERS.length})
              </button>
              <button
                onClick={() => setActiveTab('bids')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'bids' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Мои отклики ({MOCK_BIDS.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'completed' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Завершенные ({MOCK_COMPLETED.length})
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`relative px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'offers' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Предложения
                {MOCK_OFFERS.length > 0 && (
                  <span className="absolute top-2.5 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                )}
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
                  MOCK_ACTIVE_ORDERS.length === 0 ? (
                    <div className="bg-slate-card border border-slate-border rounded-2xl p-12 text-center">
                      <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">У вас нет активных заказов</h3>
                      <p className="text-slate-400 mb-6">Найдите подходящий проект и сделайте первый отклик.</p>
                      <Link href="/projects" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors">
                        Найти проекты
                      </Link>
                    </div>
                  ) : (
                    MOCK_ACTIVE_ORDERS.map((order) => {
                      const { text: timeLeftText, isUrgent } = formatTimeLeft(order.deadline);
                      
                      return (
                        <div key={order.id} className="bg-slate-card border border-slate-border rounded-2xl p-6 hover:border-slate-700 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <div className="flex-1">
                              <Link href={`/workspace/${order.id}`} className="group inline-flex items-start gap-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight">
                                  {order.title}
                                </h3>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-primary shrink-0 mt-1" />
                              </Link>
                              
                              <div className="flex items-center gap-3 mt-3">
                                <Image 
                                  src={order.client.avatar} 
                                  alt={order.client.name} 
                                  width={24} 
                                  height={24} 
                                  className="rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="text-sm text-slate-300">{order.client.name}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                              <div className="text-xl font-bold text-white">
                                ${order.price.toLocaleString('en-US')}
                              </div>
                              {order.isEscrowReady && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Средства зарезервированы
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-border/50">
                            <div className={`flex items-center gap-2 text-sm font-medium ${isUrgent ? 'text-orange-400' : 'text-slate-300'}`}>
                              {isUrgent ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              {timeLeftText}
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <button
                                onClick={(e) => handleWriteToClient(e)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Написать заказчику
                              </button>
                              <Link
                                href={`/workspace/${order.id}`}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-xl hover:bg-primary/20 transition-colors"
                              >
                                В рабочую область
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
                  MOCK_BIDS.map((bid) => (
                    <div key={bid.id} className="bg-slate-card border border-slate-border rounded-2xl p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">{bid.title}</h3>
                          <div className="flex items-center gap-3">
                            <Image 
                              src={bid.client.avatar} 
                              alt={bid.client.name} 
                              width={24} 
                              height={24} 
                              className="rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-sm text-slate-300">{bid.client.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-1">
                          <span className="text-sm text-slate-400">Ваша ставка:</span>
                          <span className="text-lg font-bold text-white">${bid.myBid.toLocaleString('en-US')}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-border/50">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" />
                          Отклик отправлен {bid.dateApplied}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                          {bid.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* COMPLETED */}
                {activeTab === 'completed' && (
                  MOCK_COMPLETED.map((order) => (
                    <div key={order.id} className="bg-slate-card border border-slate-border rounded-2xl p-6 opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">{order.title}</h3>
                          <div className="flex items-center gap-3">
                            <Image 
                              src={order.client.avatar} 
                              alt={order.client.name} 
                              width={24} 
                              height={24} 
                              className="rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-sm text-slate-300">{order.client.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-1">
                          <span className="text-lg font-bold text-white">${order.price.toLocaleString('en-US')}</span>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < order.rating ? 'fill-current' : 'text-slate-600'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-border/50 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Завершен {order.dateCompleted}
                      </div>
                    </div>
                  ))
                )}

                {/* OFFERS */}
                {activeTab === 'offers' && (
                  MOCK_OFFERS.length === 0 ? (
                    <div className="bg-slate-card border border-slate-border rounded-2xl p-12 text-center">
                      <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">У вас пока нет персональных предложений</h3>
                      <p className="text-slate-400">Компании могут отправлять вам предложения напрямую, если им понравится ваше портфолио.</p>
                    </div>
                  ) : (
                    MOCK_OFFERS.map((offer) => (
                      <div key={offer.id} className="bg-slate-card border border-primary/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.1)]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                              Новое предложение
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{offer.title}</h3>
                            <div className="flex items-center gap-3">
                              <Image 
                                src={offer.company.avatar} 
                                alt={offer.company.name} 
                                width={24} 
                                height={24} 
                                className="rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-sm text-slate-300">{offer.company.name}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                            <span className="text-sm text-slate-400">Бюджет:</span>
                            <span className="text-2xl font-bold text-white">${offer.price.toLocaleString('en-US')}</span>
                          </div>
                        </div>
                        
                        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                          <p className="text-sm text-slate-300 italic">&quot;{offer.message}&quot;</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-border/50">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock className="w-4 h-4" />
                            Получено {offer.dateReceived}
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors">
                              Отклонить
                            </button>
                            <button className="flex-1 sm:flex-none px-6 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors">
                              Обсудить проект
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6 sticky top-28">
              <h2 className="text-xl font-bold text-white mb-6">Сводка</h2>
              
              {/* Available to withdraw block */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-slate-300 mb-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Доступно к выводу</span>
                  </div>
                  <div className="text-3xl font-bold text-white flex items-baseline gap-1 mb-4">
                    <span className="text-xl text-primary/60 font-semibold">$</span>
                    {availableToWithdraw.toLocaleString('en-US')}
                  </div>
                  <button className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)]">
                    Вывести средства
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-base font-medium">Заморожено в Эскроу</span>
                  </div>
                  <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                    <span className="text-xl text-slate-500 font-semibold">$</span>
                    {totalFrozen.toLocaleString('en-US')}
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Сумма по активным проектам
                  </p>
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
              </div>

              <div className="mt-8 p-5 bg-[#1A272D]/40 border border-[#23353D] rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#00B2FF] shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Средства в Эскроу надежно защищены. Они будут переведены на ваш счет сразу после того, как заказчик примет работу.
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
