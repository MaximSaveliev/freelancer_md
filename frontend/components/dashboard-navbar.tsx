'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Handshake, Bell, MessageSquare, Search, ChevronDown, User, Settings, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

import { useRouter, usePathname } from 'next/navigation';

export function DashboardNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Александр Ионеску',
      avatar: 'https://picsum.photos/seed/company/150/150',
      message: 'Здравствуйте! Готов обсудить детали проекта.',
      time: '10 мин назад',
      isRead: false,
    },
    {
      id: 2,
      sender: 'Елена П.',
      avatar: 'https://picsum.photos/seed/elena/150/150',
      message: 'Да, я могу сделать это до пятницы.',
      time: '1 час назад',
      isRead: false,
    },
    {
      id: 3,
      sender: 'Дмитрий С.',
      avatar: 'https://picsum.photos/seed/dmitry/150/150',
      message: 'Спасибо за работу!',
      time: 'Вчера',
      isRead: true,
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Новый отклик на проект',
      message: 'Фрилансер Искандер Эйви оставил отклик на ваш проект "Разработка интернет-магазина".',
      time: '5 мин назад',
      isRead: false,
    },
    {
      id: 2,
      title: 'Проект завершен',
      message: 'Заказчик принял вашу работу по проекту "Дизайн логотипа". Средства зачислены на ваш счет.',
      time: '2 часа назад',
      isRead: true,
    },
    {
      id: 3,
      title: 'Новое сообщение',
      message: 'У вас новое сообщение от Александра Ионеску.',
      time: '1 день назад',
      isRead: true,
    }
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserRole(localStorage.getItem('userRole') || 'freelancer');
    
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markMessageAsRead = (id: number) => {
    setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsProfileOpen(false);
    router.push('/login');
  };

  const isClient = userRole === 'client';
  const profileLink = isClient ? '/client-profile' : '/profile';
  const userName = isClient ? 'Александр Ионеску' : 'Искандер Эйви';
  const userTitle = isClient ? 'Заказчик' : 'Фрилансер';
  const avatarSrc = isClient ? 'https://picsum.photos/seed/company/150/150' : 'https://picsum.photos/seed/avatar/150/150';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-border bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Search */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-background-dark group-hover:scale-105 transition-transform">
                <Handshake className="w-5 h-5 font-bold" />
              </div>
              <div className="hidden md:flex flex-col">
                <h2 className="text-xl font-bold tracking-tight text-white leading-none">freelancer.md</h2>
              </div>
            </Link>

            <div className="hidden lg:flex relative group w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 bg-slate-card/50 border border-slate-border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all" 
                placeholder="Поиск..." 
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {isClient ? (
              <Link href="/freelancers" className={`text-sm font-medium transition-colors ${pathname === '/freelancers' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Найти фрилансеров</Link>
            ) : (
              <Link href="/projects" className={`text-sm font-medium transition-colors ${pathname === '/projects' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Найти проекты</Link>
            )}
            <Link href="/orders" className={`text-sm font-medium transition-colors ${pathname === '/orders' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Мои заказы</Link>
          </div>

          {/* Right Section: Notifications + Profile */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={messagesRef}>
              <button 
                onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
              >
                <MessageSquare className="w-5 h-5" />
                {messages.filter(m => !m.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full"></span>
                )}
              </button>

              <AnimatePresence>
                {isMessagesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-card border border-slate-border rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-border flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Сообщения</h3>
                      {messages.filter(m => !m.isRead).length > 0 && (
                        <span className="text-xs text-slate-400">{messages.filter(m => !m.isRead).length} новых</span>
                      )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      {messages.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          У вас нет сообщений
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {messages.map((msg) => (
                            <Link 
                              key={msg.id} 
                              href="/messages"
                              onClick={() => {
                                markMessageAsRead(msg.id);
                                setIsMessagesOpen(false);
                              }}
                              className={`p-4 border-b border-slate-border/50 hover:bg-slate-800/50 transition-colors relative group flex items-start gap-3 ${!msg.isRead ? 'bg-cyan-500/5' : ''}`}
                            >
                              <Image 
                                src={msg.avatar} 
                                alt={msg.sender} 
                                width={40} 
                                height={40} 
                                className="rounded-full border border-slate-border object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                  <h4 className={`text-sm font-medium truncate pr-2 ${!msg.isRead ? 'text-white' : 'text-slate-200'}`}>
                                    {msg.sender}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{msg.time}</span>
                                </div>
                                <p className={`text-xs line-clamp-1 ${!msg.isRead ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>
                                  {msg.message}
                                </p>
                              </div>
                              {!msg.isRead && (
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-500"></div>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 border-t border-slate-border text-center bg-slate-800/20">
                      <Link 
                        href="/messages"
                        onClick={() => setIsMessagesOpen(false)}
                        className="text-xs font-medium text-primary hover:text-primary-light transition-colors"
                      >
                        Все сообщения
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-card border border-slate-border rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-border flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Уведомления</h3>
                      {notifications.length > 0 && (
                        <span className="text-xs text-slate-400">{notifications.length} новых</span>
                      )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          У вас нет новых уведомлений
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-4 border-b border-slate-border/50 hover:bg-slate-800/50 transition-colors relative group ${!notification.isRead ? 'bg-primary/5' : ''}`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium mb-1 ${!notification.isRead ? 'text-white' : 'text-slate-200'}`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                                    {notification.message}
                                  </p>
                                  <span className="text-[10px] text-slate-500">{notification.time}</span>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-all"
                                  title="Удалить"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              {!notification.isRead && (
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-slate-border text-center bg-slate-800/20">
                        <button 
                          onClick={() => setNotifications([])}
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          Очистить все
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-slate-border mx-2"></div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image 
                  src={avatarSrc} 
                  alt="Avatar" 
                  width={36} 
                  height={36} 
                  className="rounded-full border border-slate-border object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-bold text-white leading-tight">{userName}</span>
                  <span className="text-xs text-slate-400">{userTitle}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-slate-card border border-slate-border rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-border sm:hidden">
                      <p className="text-sm font-bold text-white">{userName}</p>
                      <p className="text-xs text-slate-400">{userTitle}</p>
                    </div>
                    <div className="py-2">
                      <Link href={profileLink} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                        <User className="w-4 h-4" />
                        Мой профиль
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                        <Settings className="w-4 h-4" />
                        Настройки
                      </Link>
                    </div>
                    <div className="py-2 border-t border-slate-border">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Выйти
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
