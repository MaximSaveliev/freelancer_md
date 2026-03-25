'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Handshake, Menu, Globe, ChevronDown, User, LogOut, Crown, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar } from '@/components/avatar';
import { getProfile } from '@/lib/api/bl';

export function Navbar() {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('RU');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [userName, setUserName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'RU', name: 'Русский' },
    { code: 'RO', name: 'Română' },
    { code: 'EN', name: 'English' },
  ];

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    setUserRole(localStorage.getItem('userRole') || 'freelancer');
    setUserPlan((localStorage.getItem('userPlan') as 'free' | 'pro' | 'premium') || 'free');

    if (loggedIn) {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        getProfile(userId)
          .then(profile => {
            setUserName(`${profile.first_name} ${profile.last_name}`.trim());
            setAvatarUrl(profile.avatar_url ?? null);
          })
          .catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setIsLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
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
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    router.push('/');
  };

  const isClient = userRole === 'client';
  const profileLink = isClient ? '/client-profile' : '/profile';
  const userTitle = isClient ? 'Заказчик' : 'Фрилансер';
  const displayName = userName || (isClient ? 'Заказчик' : 'Фрилансер');

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-border bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-background-dark group-hover:scale-105 transition-transform">
              <Handshake className="w-5 h-5 font-bold" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold tracking-tight text-white leading-none">freelancer.md</h2>
              <span className="text-[10px] uppercase tracking-widest text-primary/80 font-semibold">Premium</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {isLoggedIn ? (
              <>
                {isClient ? (
                  <Link href="/freelancers" className={`text-sm font-medium transition-colors ${pathname === '/freelancers' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Найти фрилансеров</Link>
                ) : (
                  <Link href="/projects" className={`text-sm font-medium transition-colors ${pathname === '/projects' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Найти проекты</Link>
                )}
                <Link href="/orders" className={`text-sm font-medium transition-colors ${pathname === '/orders' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Мои заказы</Link>
              </>
            ) : (
              <>
                <Link href="/" className={`text-sm font-semibold relative group ${pathname === '/' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
                  Как это работает
                  {pathname === '/' && <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full" />}
                </Link>
                <Link href="/projects" className={`text-sm font-medium transition-colors ${pathname === '/projects' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Найти проекты</Link>
                <Link href="/freelancers" className={`text-sm font-medium transition-colors ${pathname === '/freelancers' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Найти исполнителей</Link>
              </>
            )}
          </div>

          {/* Right: Lang + Auth */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer py-2"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLang}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-36 bg-slate-card border border-slate-border rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {languages.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => { setCurrentLang(lang.code); setIsLangOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer flex items-center justify-between ${currentLang === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                        >
                          {lang.name}
                          {currentLang === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-5 bg-slate-border" />

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className={`rounded-full p-0.5 ${
                      userRole === 'freelancer' && userPlan === 'premium' ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                      : userRole === 'freelancer' && userPlan === 'pro' ? 'bg-gradient-to-br from-primary to-purple-600'
                      : 'bg-transparent'
                    }`}>
                      <Avatar src={avatarUrl} name={displayName} size={36} className="border border-slate-border bg-slate-card" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white leading-tight">{displayName}</span>
                        {userRole === 'freelancer' && userPlan === 'premium' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        {userRole === 'freelancer' && userPlan === 'pro' && <Zap className="w-3.5 h-3.5 text-primary" />}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-slate-card border border-slate-border rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-slate-border">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-white">{displayName}</p>
                            {userRole === 'freelancer' && userPlan === 'premium' && (
                              <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold rounded flex items-center gap-1 uppercase tracking-wider">
                                <Crown className="w-2.5 h-2.5" /> Premium
                              </span>
                            )}
                            {userRole === 'freelancer' && userPlan === 'pro' && (
                              <span className="px-1.5 py-0.5 bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold rounded flex items-center gap-1 uppercase tracking-wider">
                                <Zap className="w-2.5 h-2.5" /> PRO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{userTitle}</p>
                        </div>
                        <div className="py-2">
                          <Link href={profileLink} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                            <User className="w-4 h-4" /> Личный профиль
                          </Link>
                        </div>
                        <div className="py-2 border-t border-slate-border">
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors cursor-pointer">
                            <LogOut className="w-4 h-4" /> Выход
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer">Войти</Link>
                  <Link href="/register" className="bg-primary hover:bg-primary/90 text-background-dark text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(19,200,236,0.3)] hover:shadow-[0_0_20px_rgba(19,200,236,0.5)] cursor-pointer">
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <div className="relative" ref={langRef}>
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer py-2">
                <Globe className="w-4 h-4" />
                <span>{currentLang}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-36 bg-slate-card border border-slate-border rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {languages.map(lang => (
                        <button key={lang.code} onClick={() => { setCurrentLang(lang.code); setIsLangOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer flex items-center justify-between ${currentLang === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                        >
                          {lang.name}
                          {currentLang === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white cursor-pointer p-2">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-border bg-background-dark/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {isLoggedIn ? (
                <>
                  {isClient
                    ? <Link href="/freelancers" className="block py-2 text-base font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Найти фрилансеров</Link>
                    : <Link href="/projects" className="block py-2 text-base font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Найти проекты</Link>
                  }
                  <Link href="/orders" className="block py-2 text-base font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Мои заказы</Link>
                  <div className="pt-4 border-t border-slate-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar src={avatarUrl} name={displayName} size={40} className="border border-slate-border bg-slate-card" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white leading-tight">{displayName}</span>
                          {userRole === 'freelancer' && userPlan === 'premium' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          {userRole === 'freelancer' && userPlan === 'pro' && <Zap className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <p className="text-xs text-slate-400">{userTitle}</p>
                      </div>
                    </div>
                    <Link href={profileLink} className="flex items-center gap-3 py-2 text-sm text-slate-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-4 h-4" /> Личный профиль
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                      <LogOut className="w-4 h-4" /> Выход
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/" className="block py-2 text-base font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Как это работает</Link>
                  <Link href="/projects" className="block py-2 text-base font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Найти проекты</Link>
                  <Link href="/freelancers" className="block py-2 text-base font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Найти исполнителей</Link>
                  <div className="pt-4 border-t border-slate-border flex flex-col gap-3">
                    <Link href="/login" className="flex items-center justify-center w-full py-2.5 text-sm font-bold text-white hover:text-primary border border-slate-600 hover:border-primary rounded-xl transition-colors cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>Войти</Link>
                    <Link href="/register" className="flex items-center justify-center w-full py-2.5 text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-[0_0_15px_rgba(19,200,236,0.3)] cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>Регистрация</Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
