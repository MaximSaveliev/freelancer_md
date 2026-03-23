'use client';

import { useState } from 'react';
import { Briefcase, Monitor, Handshake, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);
  const router = useRouter();

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
        <div className="w-full max-w-4xl bg-slate-card/80 backdrop-blur-xl border border-slate-border rounded-3xl p-8 md:p-12 shadow-2xl mx-auto">
          <div className="flex flex-col items-center">
            {/* Header */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              Присоединяйтесь к сообществу
            </h1>
            <p className="text-slate-400 text-base md:text-lg mb-10 text-center">
              Выберите, как вы планируете использовать платформу
            </p>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6 w-full mb-10">
              {/* Client Card */}
              <button
                onClick={() => setSelectedRole('client')}
                className={`relative flex flex-col items-center text-center p-8 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  selectedRole === 'client'
                    ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(19,200,236,0.15)]'
                    : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${
                  selectedRole === 'client' ? 'bg-primary/20 text-primary' : 'bg-slate-800/80 text-primary'
                }`}>
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Заказчик</h3>
                <p className="text-sm text-slate-400">Ищу исполнителя для проекта</p>
              </button>

              {/* Freelancer Card */}
              <button
                onClick={() => setSelectedRole('freelancer')}
                className={`relative flex flex-col items-center text-center p-8 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  selectedRole === 'freelancer'
                    ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(19,200,236,0.15)]'
                    : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${
                  selectedRole === 'freelancer' ? 'bg-primary/20 text-primary' : 'bg-slate-800/80 text-primary'
                }`}>
                  <Monitor className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Фрилансер</h3>
                <p className="text-sm text-slate-400">Хочу находить заказы и зарабатывать</p>
              </button>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => {
                if (selectedRole === 'freelancer') {
                  router.push('/register/freelancer');
                } else if (selectedRole === 'client') {
                  router.push('/register/client');
                }
              }}
              disabled={!selectedRole}
              className={`w-full max-w-md py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                selectedRole
                  ? 'bg-primary text-background-dark hover:bg-primary/90 shadow-[0_0_20px_rgba(19,200,236,0.3)] cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Продолжить
            </button>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-slate-800/50 w-full text-center text-sm text-slate-400">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer">
                Войти
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
