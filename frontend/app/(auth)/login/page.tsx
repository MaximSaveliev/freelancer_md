'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Handshake, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login as authLogin } from '@/lib/auth';

type Role = 'client' | 'freelancer';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: authenticate and obtain JWT tokens
      const authResult = await authLogin({ email: formData.email, password: formData.password });
      if (!authResult.ok) {
        setError(authResult.error ?? 'Неверный email или пароль.');
        return;
      }

      // Step 2: fetch BL user to get id and verify role
      const { getUserByEmail } = await import('@/lib/api/bl');
      const user = await getUserByEmail(formData.email);

      const expectedRole = role === 'client' ? 'CLIENT' : 'FREELANCER';
      if (user.role !== expectedRole) {
        setError(
          user.role === 'CLIENT'
            ? 'Этот аккаунт зарегистрирован как заказчик. Выберите «Заказчик».'
            : 'Этот аккаунт зарегистрирован как фрилансер. Выберите «Фрилансер».'
        );
        return;
      }

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_email', user.email);

      router.push(role === 'freelancer' ? '/profile' : '/client-profile');
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 404) {
        setError('Пользователь с таким email не найден.');
      } else {
        setError('Ошибка входа. Проверьте данные и попробуйте снова.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background-dark">
      {/* Background effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="flex items-center gap-3 group mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-background-dark group-hover:scale-105 transition-transform shadow-lg shadow-primary/20">
          <Handshake className="w-6 h-6 font-bold" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white leading-none">freelancer.md</h2>
      </Link>

      <div className="w-full flex justify-center relative z-10">
        <div className="w-full max-w-md bg-slate-card/80 backdrop-blur-xl border border-slate-border rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">С возвращением</h1>
            <p className="text-slate-400 text-sm">Войдите в свой аккаунт, чтобы продолжить</p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1 bg-slate-800/50 rounded-xl mb-8 relative">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors relative z-10 ${role === 'client' ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Заказчик
            </button>
            <button
              type="button"
              onClick={() => setRole('freelancer')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors relative z-10 ${role === 'freelancer' ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Фрилансер
            </button>
            
            {/* Animated Indicator */}
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-700 rounded-lg shadow-sm"
              initial={false}
              animate={{ 
                left: role === 'client' ? '4px' : 'calc(50%)' 
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Пароль</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  Забыли пароль?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-bold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Войти <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-white font-medium hover:text-primary transition-colors">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
