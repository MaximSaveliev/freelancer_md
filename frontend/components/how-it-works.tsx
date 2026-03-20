'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Users, ShieldCheck, Search, MessageSquare, Wallet } from 'lucide-react';

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'business' | 'freelancer'>('business');

  const businessSteps = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: '1. Опубликуйте проект',
      description: 'Опишите задачу, укажите бюджет и сроки. Это бесплатно и занимает 2 минуты.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: '2. Выберите исполнителя',
      description: 'Получайте отклики, смотрите портфолио и рейтинги. Общайтесь в чате.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: '3. Безопасная оплата',
      description: 'Средства замораживаются в эскроу и выплачиваются только после принятия работы.',
    },
  ];

  const freelancerSteps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: '1. Найдите проект',
      description: 'Выбирайте подходящие заказы в каталоге. Откликайтесь на интересные задачи, предлагайте свою цену и сроки выполнения. Это ваш шанс заявить о себе.',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: '2. Обсудите детали',
      description: 'Общайтесь с заказчиком напрямую в удобном чате. Уточняйте техническое задание, задавайте вопросы и приступайте к выполнению проекта.',
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: '3. Гарантия оплаты',
      description: 'Работайте спокойно: бюджет проекта резервируется в системе эскроу. После того как заказчик примет работу, деньги мгновенно поступят на ваш баланс.',
    },
  ];

  const currentSteps = activeTab === 'business' ? businessSteps : freelancerSteps;

  return (
    <section className="py-24 bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Как это работает</h2>
          <div className="inline-flex p-1 bg-slate-card rounded-xl border border-slate-border">
            <button 
              onClick={() => setActiveTab('business')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'business' 
                  ? 'bg-primary text-background-dark shadow-lg' 
                  : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              Для Бизнеса
            </button>
            <button 
              onClick={() => setActiveTab('freelancer')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'freelancer' 
                  ? 'bg-primary text-background-dark shadow-lg' 
                  : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              Для Фрилансеров
            </button>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {currentSteps.map((step, index) => (
              <div 
                key={index}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-8 bg-slate-card border border-slate-border rounded-2xl h-full flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-background-dark rounded-full flex items-center justify-center text-primary mb-6 shadow-inner">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
