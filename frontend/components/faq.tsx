'use client';

import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function FAQ() {
  const faqs = [
    {
      question: 'Как работает Безопасная сделка?',
      answer: 'Заказчик резервирует сумму гонорара в нашем сервисе (эскроу). Исполнитель видит это и приступает к работе. Деньги перечисляются исполнителю только после того, как заказчик подтвердит выполнение работы.',
    },
    {
      question: 'Какие способы вывода средств доступны?',
      answer: 'Мы поддерживаем вывод на банковские карты (Visa/Mastercard) молдавских банков, а также международные переводы и электронные кошельки.',
    },
    {
      question: 'Можно ли работать с компаниями из-за рубежа?',
      answer: 'Да, платформа freelancer.md открыта для международных заказов. Интерфейс доступен на нескольких языках, а выплаты конвертируются автоматически.',
    },
  ];

  return (
    <section className="py-24 bg-background-dark">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-10 text-center">Частые вопросы</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.details
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-slate-card border border-slate-border rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-white">
                <h3 className="font-medium">{faq.question}</h3>
                <ChevronDown className="w-5 h-5 transition duration-300 group-open:-rotate-180" />
              </summary>
              <p className="mt-4 leading-relaxed text-slate-400 text-sm">
                {faq.answer}
              </p>
            </motion.details>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Готовы начать?</h2>
          <p className="text-slate-400 text-lg mb-8">Присоединяйтесь к тысячам профессионалов и развивайте свой бизнес уже сегодня.</p>
          <Link href="/register" className="inline-block bg-primary hover:bg-primary/90 text-background-dark text-lg font-bold px-10 py-4 rounded-2xl transition-all shadow-lg hover:shadow-primary/40 cursor-pointer">
            Зарегистрироваться бесплатно
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
