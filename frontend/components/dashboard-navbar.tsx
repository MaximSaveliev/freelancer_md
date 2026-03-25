'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Handshake, Bell, MessageSquare, Search, ChevronDown, User, Settings, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, usePathname } from 'next/navigation';
import { getProfile } from '@/lib/api/bl';
import { Avatar } from '@/components/avatar';

export function DashboardNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [avatarSrc, setAvatarSrc] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Новый отклик на проект', message: 'Фрилансер оставил отклик на ваш проект.', time: '5 мин назад', isRead: false },
    { id: 2, title: 'Проект завершён', message: 'Средства зачислены на ваш счёт.', time: '2 часа назад', isRead: true },
  ]);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'freelancer';
    setUserRole(role);

    const userId = localStorage.getItem('user_id');
    if (userId) {
      getProfile(userId)
        .then(p => {
          setUserName(`${p.first_name} ${p.last_name}`.trim());
          if (p.avatar_url) setAvatarSrc(p.avatar_url);
        })
        .catch(() => {});
    }

    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) setIsMessagesOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('userPlan');
    setIsProfileOpen(false);
    router.push('/login');
  };

  const isClient = userRole === 'client';
  const profileLink = isClient ? '/client-profile' : '/profile';
  const userTitle = isClient ? 'Заказчик' : 'Фрилансер';
  const displayName = userName || userTitle;

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

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {isClient ? (
              <Link href="/freelancers" className={`text-sm font-medium transition-colors ${pathname === '/freelancers' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Найти фрилансеров</Link>
            ) : (
              <Link href="/projects" className={`text-sm font-medium transition-colors ${pathname === '/projects' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Найти проекты</Link>
            )}
            <Link href="/orders" className={`text-sm font-medium transition-colors ${pathname === '/orders' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Мои заказы</Link>
          </div>

          {/* Right: Messages + Notifications + Profile */}
          <div className="flex items-center gap-4">

            {/* Messages */}
            <div className="relative" ref={messagesRef}>
              <button
                onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isMessagesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-80 bg-slate-card border border-slate-border rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-border">
                      <h3 className="text-sm font-bold text-white">Сообщения</h3>
                    </div>
                    <div className="p-8 text-center text-slate-400 text-sm">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Чат скоро будет доступен
                    </div>
                    <div className="p-3 border-t border-slate-border text-center bg-slate-800/20">
                      <Link href="/messages" onClick={() => setIsMessagesOpen(false)} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        Открыть сообщения
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
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
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">Нет новых уведомлений</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-slate-border/50 hover:bg-slate-800/50 relative group ${!n.isRead ? 'bg-primary/5' : ''}`}>
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium mb-1 ${!n.isRead ? 'text-white' : 'text-slate-200'}`}>{n.title}</h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{n.message}</p>
                                <span className="text-[10px] text-slate-500">{n.time}</span>
                              </div>
                              <button
                                onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
                                className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-slate-border text-center bg-slate-800/20">
                        <button onClick={() => setNotifications([])} className="text-xs text-slate-400 hover:text-white transition-colors">
                          Очистить все
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-slate-border mx-2" />

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar src={avatarSrc || null} name={displayName} size={36} className="border border-slate-border bg-slate-card" />
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-bold text-white leading-tight">{displayName}</span>
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
                      <p className="text-sm font-bold text-white">{displayName}</p>
                      <p className="text-xs text-slate-400">{userTitle}</p>
                    </div>
                    <div className="py-2">
                      <Link href={profileLink} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                        <User className="w-4 h-4" /> Мой профиль
                      </Link>
                      <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                        <Settings className="w-4 h-4" /> Настройки
                      </Link>
                    </div>
                    <div className="py-2 border-t border-slate-border">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors cursor-pointer">
                        <LogOut className="w-4 h-4" /> Выйти
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
