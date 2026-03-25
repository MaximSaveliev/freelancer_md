'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Handshake, Eye, EyeOff, Upload, ChevronDown, ArrowLeft, CheckCircle2, X, Monitor, Star, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { confirmEmail, register, resendEmailConfirmation } from '@/lib/auth';

// Custom Dropdown Component
function Dropdown({ value, onChange, options, placeholder, label }: any) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o: any) => o.value === value);

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
      <div
        onClick={() => setOpen(!open)}
        className={`w-full bg-slate-800/50 border rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all duration-300 ${
          open ? 'border-primary shadow-[0_0_15px_rgba(242,125,38,0.15)]' : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        <span className={value ? 'text-white' : 'text-slate-500'}>
          {value ? selectedOption?.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${open ? 'rotate-180 text-primary' : ''}`} />
      </div>
      
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto">
                {options.map((opt: any) => (
                  <div
                    key={opt.value}
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`p-4 cursor-pointer transition-colors ${
                      value === opt.value ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-slate-700/50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className={`font-medium ${value === opt.value ? 'text-primary' : 'text-white'}`}>{opt.label}</div>
                    {opt.description && <div className="text-sm text-slate-400 mt-1">{opt.description}</div>}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FreelancerRegistration() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    specialization: '',
    experienceLevel: '',
  });

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Partial Registration Logic
  useEffect(() => {
    const savedStep = localStorage.getItem('freelancer_registration_step');
    if (savedStep && parseInt(savedStep) > 1) {
      setStep(parseInt(savedStep));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('freelancer_registration_step', step.toString());
  }, [step]);

  // Validation Logic
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isEmailMatch = isEmailValid && formData.email === formData.confirmEmail;
  const isEmailError = formData.confirmEmail.length > 0 && !isEmailMatch;

  const isPasswordValid = formData.password.length >= 8;
  const isPasswordMatch = isPasswordValid && formData.password === formData.confirmPassword;
  const isPasswordError = formData.confirmPassword.length > 0 && !isPasswordMatch;

  // Username is ignored for backend registration for now.
  const isUsernameValid = formData.username.length >= 3;

  const isStep1Valid = isEmailMatch && isPasswordMatch;
  const isStep3Valid = formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
  const isStep4Valid = formData.specialization !== '' && formData.experienceLevel !== '';

  // OTP Timer
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 0);
  };

  const submitRegistration = async () => {
    setServerError(null);
    setInfoMessage(null);

    if (!isStep1Valid) return;

    setIsSubmitting(true);
    try {
      const res = await register({ email: formData.email, password: formData.password });
      if (!res.ok) {
        setServerError(res.error);
        return;
      }

      const resendRes = await resendEmailConfirmation({ email: formData.email });
      if (!resendRes.ok) {
        setInfoMessage('Аккаунт создан. Но код подтверждения не удалось отправить автоматически. Нажмите “Отправить код повторно”.');
      } else {
        setInfoMessage('Код подтверждения отправлен на email.');
      }

      clearOtp();
      setTimer(60);
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tryConfirmOtp = async (explicitOtp?: string) => {
    const code = explicitOtp ?? otp.join('');
    if (!/^\d{6}$/.test(code)) return;

    setServerError(null);
    setInfoMessage(null);
    setIsConfirming(true);
    try {
      const res = await confirmEmail({ email: formData.email, token: code });
      if (!res.ok) {
        setServerError(res.error);
        return;
      }

      setInfoMessage(res.data.message || 'Email confirmed');
      setStep(3);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const joined = newOtp.join('');
    if (joined.length === 6 && /^\d{6}$/.test(joined)) {
      void tryConfirmOtp(joined);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);

      const nextIndex = Math.min(pastedData.length, 5);
      otpRefs.current[nextIndex]?.focus();

      if (pastedData.length === 6) {
        void tryConfirmOtp(pastedData);
      }
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const gradeMap: Record<string, 'JUNIOR' | 'MIDDLE' | 'SENIOR'> = {
    junior: 'JUNIOR',
    middle: 'MIDDLE',
    senior: 'SENIOR',
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { createUser, createProfile } = await import('@/lib/api/bl');
      const id = crypto.randomUUID();
      await createUser({ id, email: formData.email, role: 'FREELANCER' });
      await createProfile({
        user_id: id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        grade: gradeMap[formData.experienceLevel],
      });
      if (avatarFile) {
        const { uploadAvatar } = await import('@/lib/api/bl');
        await uploadAvatar(id, id, avatarFile).catch(() => {});
      }
      localStorage.setItem('user_id', id);
      localStorage.setItem('user_role', 'FREELANCER');
      localStorage.setItem('user_email', formData.email);
      localStorage.setItem('userRole', 'freelancer');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.removeItem('freelancer_registration_step');
      router.push('/profile');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (isMatch: boolean, isError: boolean) => {
    const base = "w-full bg-slate-800/50 border rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none transition-all duration-300";
    if (isMatch) return `${base} border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] focus:border-blue-500`;
    if (isError) return `${base} border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:border-red-500 text-red-100`;
    return `${base} border-slate-700 focus:border-slate-500`;
  };

  const specializations = [
    { value: 'dev', label: 'Разработка и IT', description: 'Web-сайты, Мобильные приложения, ПО' },
    { value: 'design', label: 'Дизайн и Креатив', description: 'UI/UX, Логотипы, Иллюстрации, Графика' },
    { value: 'marketing', label: 'Маркетинг и SMM', description: 'Реклама, Продвижение, SEO, Копирайтинг' },
    { value: 'media', label: 'Фото, Видео и Дроны', description: 'Монтаж, Съемка, Обработка' },
    { value: 'text', label: 'Тексты и Переводы', description: 'Локализация, Написание статей, Редактура' },
  ];

  const experienceLevels = [
    { value: 'junior', label: 'Junior (Начинающий)', description: 'Опыт до 1 года, готов к простым задачам для портфолио' },
    { value: 'middle', label: 'Middle (Специалист)', description: 'Опыт 1–3 года, уверенно решает стандартные бизнес-задачи' },
    { value: 'senior', label: 'Senior (Профи)', description: 'Опыт 3+ года, эксперт, готов к сложным и нестандартным проектам' },
  ];

  return (
    <div className="min-h-screen bg-background-dark flex flex-col md:flex-row">
      {/* Left Pane - Branding & Value Prop */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group inline-flex">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
              <Handshake className="w-6 h-6 font-bold" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">freelancer.md</h2>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 border border-blue-500/20">
            <Monitor className="w-4 h-4" />
            Для фрилансеров
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Зарабатывайте на том, что любите
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Получите доступ к тысячам проектов от проверенных заказчиков. Развивайте свои навыки и увеличивайте доход.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <p>Гарантия оплаты: средства резервируются до начала работы.</p>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-blue-400" />
              </div>
              <p>Справедливый рейтинг и отзывы за каждый выполненный проект.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm">
          © {new Date().getFullYear()} freelancer.md. Все права защищены.
        </div>
      </div>

      {/* Right Pane - Registration Form */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-50">
          <motion.div 
            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Mobile Header */}
        <header className="md:hidden p-6 flex justify-between items-center relative z-10 border-b border-slate-800 bg-background-dark/80 backdrop-blur-md sticky top-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white">
              <Handshake className="w-5 h-5 font-bold" />
            </div>
          </Link>
          <button onClick={() => router.push('/')} className="text-slate-400 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 min-h-[calc(100vh-80px)] md:min-h-screen">
          <div className="w-full max-w-md">
            
            {/* Top Navigation inside form area */}
            <div className="flex justify-between items-center mb-8">
              <button 
                onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
              <div className="text-sm text-slate-500 font-medium">
                Шаг {step} из 4
              </div>
            </div>

            {(serverError || infoMessage) && (
              <div
                className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                  serverError ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-blue-500/30 bg-blue-500/10 text-slate-200'
                }`}
              >
                {serverError ?? infoMessage}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* STEP 1: CREDENTIALS */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Создать аккаунт</h2>
                    <p className="text-slate-400 text-sm sm:text-base">Заполните данные для входа в систему</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Логин (Username)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">@</span>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="iskander17"
                          className={`pl-10 ${getInputClass(isUsernameValid, false)}`}
                          autoComplete="off"
                        />
                        {isUsernameValid && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">Пока не используется для регистрации (только email + пароль).</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="mail@example.com"
                        className={getInputClass(isEmailValid, false)}
                        autoComplete="email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Подтверждение E-mail</label>
                      <input
                        type="email"
                        name="confirmEmail"
                        value={formData.confirmEmail}
                        onChange={handleInputChange}
                        placeholder="mail@example.com"
                        className={getInputClass(isEmailMatch, isEmailError)}
                        autoComplete="email"
                      />
                      {isEmailError && <p className="text-red-500 text-xs mt-1.5">E-mail адреса не совпадают</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Пароль</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={getInputClass(isPasswordValid, false)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Подтверждение пароля</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={getInputClass(isPasswordMatch, isPasswordError)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {isPasswordError && <p className="text-red-500 text-xs mt-1.5">Пароли не совпадают</p>}
                    </div>
                  </div>

                  <button
                    onClick={() => void submitRegistration()}
                    disabled={!isStep1Valid || isSubmitting}
                    className={`w-full py-3.5 rounded-xl font-bold text-base mt-6 transition-all duration-300 ${
                      isStep1Valid && !isSubmitting
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Отправляем…' : 'Продолжить'}
                  </button>
                  
                  <div className="text-center mt-6">
                    <p className="text-sm text-slate-400">
                      Уже есть аккаунт?{' '}
                      <Link href="/login" className="text-white font-medium hover:text-blue-400 transition-colors">
                        Войти
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: OTP VERIFICATION */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Подтверждение</h2>
                    <p className="text-slate-400 text-sm sm:text-base">
                      Мы отправили 6-значный код на <br/>
                      <span className="text-white font-medium">{formData.email}</span>
                    </p>
                  </div>

                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        disabled={isConfirming}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-14 sm:w-14 sm:h-16 bg-slate-800/50 border border-slate-700 rounded-xl text-center text-2xl font-bold text-white focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] focus:outline-none transition-all disabled:opacity-60"
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => void tryConfirmOtp()}
                    disabled={isConfirming || !/^\d{6}$/.test(otp.join(''))}
                    className={`w-full py-3 rounded-xl font-bold text-base transition-all duration-300 ${
                      !isConfirming && /^\d{6}$/.test(otp.join(''))
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isConfirming ? 'Проверяем…' : 'Подтвердить код'}
                  </button>

                  <div className="pt-2">
                    {timer > 0 ? (
                      <p className="text-sm text-slate-500">
                        Отправить код повторно через <span className="text-blue-400 font-mono">{timer}с</span>
                      </p>
                    ) : (
                      <button
                        onClick={() => void resendCode()}
                        disabled={isResending}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-60"
                      >
                        {isResending ? 'Отправляем…' : 'Отправить код повторно'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PERSONAL DATA */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Личные данные</h2>
                    <p className="text-slate-400 text-sm sm:text-base">Расскажите немного о себе заказчикам</p>
                  </div>

                  <div className="flex items-center gap-6 mb-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="relative w-24 h-24 shrink-0 rounded-full border-2 border-dashed border-slate-600 bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group overflow-hidden"
                    >
                      {avatarPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                      )}
                    </button>
                    <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    <div className="text-sm text-slate-400">
                      <p className="font-medium text-white mb-1">Фото профиля</p>
                      <p>{avatarPreview ? 'Нажмите для замены' : 'Качественное фото повышает доверие заказчиков на 40%'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Имя</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Иван"
                        className={getInputClass(formData.firstName.length > 0, false)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Фамилия</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Иванов"
                        className={getInputClass(formData.lastName.length > 0, false)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(4)}
                    disabled={!isStep3Valid}
                    className={`w-full py-3.5 rounded-xl font-bold text-base mt-8 transition-all duration-300 ${
                      isStep3Valid
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Продолжить
                  </button>
                </motion.div>
              )}

              {/* STEP 4: PROFESSIONAL PROFILE */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Профессиональный профиль</h2>
                    <p className="text-slate-400 text-sm sm:text-base">Чем вы планируете заниматься на платформе?</p>
                  </div>

                  <div className="space-y-6">
                    <Dropdown
                      label="Основная специализация"
                      placeholder="Выберите направление..."
                      options={specializations}
                      value={formData.specialization}
                      onChange={(val: string) => setFormData({ ...formData, specialization: val })}
                    />

                    <Dropdown
                      label="Уровень опыта"
                      placeholder="Выберите ваш уровень..."
                      options={experienceLevels}
                      value={formData.experienceLevel}
                      onChange={(val: string) => setFormData({ ...formData, experienceLevel: val })}
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    onClick={handleComplete}
                    disabled={!isStep4Valid || isLoading}
                    className={`w-full py-3.5 rounded-xl font-bold text-base mt-8 transition-all duration-300 relative overflow-hidden group ${
                      isStep4Valid && !isLoading
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isStep4Valid && !isLoading && (
                      <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
                    )}
                    {isLoading ? 'Регистрация...' : 'Завершить регистрацию'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
