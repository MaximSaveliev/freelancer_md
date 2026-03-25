'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, Clock, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { listCategories, createProject } from '@/lib/api/bl';
import type { Category } from '@/lib/types';

type PaymentType = 'FIXED' | 'HOURLY' | 'AUCTION';
type Grade = 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT';

export default function NewProjectPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    paymentType: 'FIXED' as PaymentType,
    budgetMin: '',
    budgetMax: '',
    budgetFixed: '',
    hourlyRate: '',
    requiredGrade: '' as Grade | '',
    isUrgent: false,
  });

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  const isValid = form.title.trim().length >= 5 && form.description.trim().length >= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');
    if (!userId) { setError('Необходимо войти в аккаунт.'); return; }

    let budget: Record<string, number> = {};
    if (form.paymentType === 'FIXED') {
      const amount = parseInt(form.budgetFixed);
      if (amount > 0) budget = { amount };
    } else if (form.paymentType === 'HOURLY') {
      const amount = parseInt(form.hourlyRate);
      if (amount > 0) budget = { amount };
    } else {
      const min = parseInt(form.budgetMin);
      const max = parseInt(form.budgetMax);
      if (min > 0 && max >= min) budget = { min, max };
    }

    setIsSubmitting(true);
    setError('');
    try {
      await createProject({
        user_id: userId,
        title: form.title.trim(),
        description: form.description.trim(),
        payment_type: form.paymentType,
        budget,
        category_id: form.categoryId || undefined,
        required_grade: (form.requiredGrade as Grade) || undefined,
        is_urgent: form.isUrgent,
      });
      router.push('/client-profile');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании проекта.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-background-dark border border-slate-border rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all';
  const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        <Link href="/client-profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>

        <div className="bg-slate-card border border-slate-border rounded-2xl p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Создать новый проект</h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label className={labelClass}>Название проекта *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Например: Разработка лендинга для стартапа"
                className={inputClass}
                maxLength={120}
              />
              <p className="text-xs text-slate-500 mt-1">{form.title.length}/120</p>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Описание *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Подробно опишите задачу, требования и ожидаемый результат..."
                rows={5}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-slate-500 mt-1">Минимум 20 символов ({form.description.length})</p>
            </div>

            {/* Category */}
            {categories.length > 0 && (
              <div>
                <label className={labelClass}>Категория</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Не указана</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment type */}
            <div>
              <label className={labelClass}>Тип оплаты</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { val: 'FIXED', label: 'Фиксированная', icon: <DollarSign className="w-4 h-4" /> },
                  { val: 'HOURLY', label: 'Почасовая', icon: <Clock className="w-4 h-4" /> },
                  { val: 'AUCTION', label: 'Аукцион', icon: <Zap className="w-4 h-4" /> },
                ] as const).map(({ val, label, icon }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm({ ...form, paymentType: val })}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.paymentType === val
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget fields */}
            {form.paymentType === 'FIXED' && (
              <div>
                <label className={labelClass}>Бюджет ($)</label>
                <input type="number" min="1" value={form.budgetFixed}
                  onChange={e => setForm({ ...form, budgetFixed: e.target.value })}
                  placeholder="500" className={inputClass} />
              </div>
            )}
            {form.paymentType === 'HOURLY' && (
              <div>
                <label className={labelClass}>Ставка ($/час)</label>
                <input type="number" min="1" value={form.hourlyRate}
                  onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                  placeholder="25" className={inputClass} />
              </div>
            )}
            {form.paymentType === 'AUCTION' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Бюджет от ($)</label>
                  <input type="number" min="0" value={form.budgetMin}
                    onChange={e => setForm({ ...form, budgetMin: e.target.value })}
                    placeholder="200" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Бюджет до ($)</label>
                  <input type="number" min="0" value={form.budgetMax}
                    onChange={e => setForm({ ...form, budgetMax: e.target.value })}
                    placeholder="800" className={inputClass} />
                </div>
              </div>
            )}

            {/* Experience level */}
            <div>
              <label className={labelClass}>Требуемый уровень</label>
              <select
                value={form.requiredGrade}
                onChange={e => setForm({ ...form, requiredGrade: e.target.value as Grade | '' })}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Любой</option>
                <option value="JUNIOR">Junior</option>
                <option value="MIDDLE">Middle</option>
                <option value="SENIOR">Senior</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            {/* Urgent */}
            <div className="flex items-center justify-between py-3 px-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div>
                <p className="text-sm font-medium text-white">Срочный проект</p>
                <p className="text-xs text-slate-400">Проект будет помечен как срочный</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isUrgent: !form.isUrgent })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isUrgent ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isUrgent ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href="/client-profile"
                className="flex-1 py-3 text-center rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors font-medium"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Создание...
                  </span>
                ) : 'Создать проект'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
