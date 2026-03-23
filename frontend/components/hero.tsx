'use client';

import { motion } from 'motion/react';
import { ArrowRight, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <div className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-card border border-slate-border mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Безопасная сделка включена</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Нанимайте быстрее.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Работайте умнее.</span><br/>
              <span className="text-primary">Прозрачные ставки.</span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Безопасные сделки через эскроу и проверенные профессионалы. Найдите идеального исполнителя или проект за считанные минуты.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link href="/register/client" className="bg-primary hover:bg-primary/90 text-background-dark text-base font-bold px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-primary/40">
                <span>Разместить проект</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register/freelancer" className="bg-slate-card hover:bg-slate-700 text-white border border-slate-border text-base font-bold px-8 py-4 rounded-2xl transition-all flex items-center justify-center cursor-pointer">
                Найти работу
              </Link>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto lg:mx-0 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-12 pr-4 py-4 bg-slate-card/50 border border-slate-border rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                placeholder="Поиск проектов или фрилансеров..." 
              />
            </div>
          </motion.div>
          
          {/* Right Visual Stack */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 w-full max-w-lg lg:max-w-none relative hidden md:block"
          >
            {/* Card 1: Project */}
            <div className="relative z-10 bg-slate-card border border-slate-border p-6 rounded-2xl shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <span className="material-symbols-outlined font-bold text-xl">{'</>'}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Разработка SaaS Платформы</h4>
                    <p className="text-sm text-slate-400">Требуется Senior React Dev</p>
                  </div>
                </div>
                <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded-lg">Активен</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-border/50">
                <div>
                  <p className="text-xs text-slate-500">Бюджет</p>
                  <p className="font-mono font-bold text-white">$1,500 - $3,000</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Откликов</p>
                  <div className="flex -space-x-2 justify-end mt-1">
                    <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQzHJKcZMH3yt77SMQkxwcbS0FWgOzmmXr1ZlIHwpeGqgc2TNy3ZYPJWCnVUc7OiPgnQtrDGW4fUkAcayAdAB3_pdu2HURaaG3JUAsTeJvXb7iCiy199xT22dQnowk_7DYp-Q6TXgQEhIGCqLtEmshHJl15yJXGLNwJc3nWxZNNxp28EviiSV6ooG7IloT20eNcec6symVNkR1HOaagLpfTRKgN2nAmkTpemdDlL0_If5kRgQzWZbviLkfQS3rB3Lnc-dMMs78mg" alt="Avatar" width={24} height={24} className="rounded-full border-2 border-slate-card object-cover" referrerPolicy="no-referrer" />
                    <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxF7I-NjONFAoeHxXEUDG_75UOZ8ybYF4XuL1uZWa6Tp2O5tWupFhnut1f6xoGVQ3McDKSItmbe673w_eu0lX58Jx9fVSonhsZSXCHMvewB6j3XsdbLUCNqfok-Q2P1SHYqvc3xELRfks6txJTTO_L-5HAYn2UdI2w-R9TOROfsBLEufkBxhfgJPkVV5wEAm3I5XyrHnAkninJfqRESuOsamxT3UhJcVzb9EXoFrg5XRbFcVw_cq-qydf83tuQcebLdSzlnEg3Rg" alt="Avatar" width={24} height={24} className="rounded-full border-2 border-slate-card object-cover" referrerPolicy="no-referrer" />
                    <div className="w-6 h-6 rounded-full border-2 border-slate-card bg-slate-700 text-[8px] flex items-center justify-center text-white font-bold">+12</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 2: Offer (Behind) */}
            <div className="absolute top-12 -right-6 z-0 bg-slate-800/80 border border-slate-border p-6 rounded-2xl w-full backdrop-blur-sm transform rotate-[3deg]">
              <div className="flex justify-between items-start mb-4 opacity-50">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <span className="material-symbols-outlined font-bold text-xl">🖌️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Редизайн логотипа</h4>
                    <p className="text-sm text-slate-400">Срочно</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
