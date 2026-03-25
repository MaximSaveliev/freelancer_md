'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Handshake, Eye, EyeOff, Upload, ChevronDown, ArrowLeft, CheckCircle2, X, Briefcase, Star, ShieldCheck } from 'lucide-react';
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

export default function ClientRegistration() {
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
    companyName: '',
    industry: '',
  });

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Partial Registration Logic
  useEffect(() => {
    const savedStep = localStorage.getItem('client_registration_step');
    if (savedStep && parseInt(savedStep) > 1) {
      setStep(parseInt(savedStep));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('client_registration_step', step.toString());
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
  const isStep3Valid = formData.firstName.trim() !== '' && formData.lastName.trim() !== '' && formData.industry !== '';

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
    // Focus first box next tick
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

      // API doesn't guarantee that it sends the code here, so we also trigger resend.
      const resendRes = await resendEmailConfirmation({ email: formData.email });
      if (!resendRes.ok) {
        // Not fatal; user can manually resend.
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
      // confirm automatically
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

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { createUser, createProfile } = await import('@/lib/api/bl');
      const id = crypto.randomUUID();
      await createUser({ id, email: formData.email, role: 'CLIENT' });
      await createProfile({
        user_id: id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName || undefined,
        industry: formData.industry || undefined,
      });
      if (avatarFile) {
        const { uploadAvatar } = await import('@/lib/api/bl');
        await uploadAvatar(id, id, avatarFile).catch(() => {});
      }
      localStorage.setItem('user_id', id);
      localStorage.setItem('user_role', 'CLIENT');
      localStorage.setItem('user_email', formData.email);
      localStorage.setItem('userRole', 'client');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.removeItem('client_registration_step');
      router.push('/client-profile');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (isMatch: boolean, isError: boolean) => {
    const base = "w-full bg-slate-800/50 border rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none transition-all duration-300";
    if (isMatch) return `${base} border-primary shadow-[0_0_15px_rgba(242,125,38,0.15)] focus:border-primary`;
    if (isError) return `${base} border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:border-red-500 text-red-100`;
    return `${base} border-slate-700 focus:border-slate-500`;
  };

  const industries = [
    { value: 'ecommerce', label: 'E-commerce & Retail', description: 'Магазины, продажи' },
    { value: 'tech', label: 'Tech & Startups', description: 'Разработка ПО, инновации' },
    { value: 'media', label: 'Media & Entertainment', description: 'Контент, фото/видео, ивенты' },
    { value: 'services', label: 'Services & Education', description: 'Услуги, курсы, обучение' },
    { value: 'realestate', label: 'Real Estate & Construction', description: 'Недвижимость, архитектура' },
  ];

  return (
    <div className="min-h-screen bg-background-dark flex flex-col md:flex-row">
      {/* Left Pane - Branding & Value Prop */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_top_left,rgba(242,125,38,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group inline-flex">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background-dark group-hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              <Handshake className="w-6 h-6 font-bold" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">freelancer.md</h2>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <Briefcase className="w-4 h-4" />
            Для заказчиков
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Найдите идеального исполнителя
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Тысячи проверенных фрилансеров готовы приступить к вашему проекту уже сегодня. Безопасные сделки и гарантия качества.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <p>Безопасная оплата: деньги переводятся только после принятия работы.</p>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <p>Проверенные отзывы и прозрачный рейтинг исполнителей.</p>
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
            className="h-full bg-primary shadow-[0_0_10px_rgba(242,125,38,0.8)]"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Mobile Header */}
        <header className="md:hidden p-6 flex justify-between items-center relative z-10 border-b border-slate-800 bg-background-dark/80 backdrop-blur-md sticky top-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background-dark">
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
                Шаг {step} из 3
              </div>
            </div>

            {(serverError || infoMessage) && (
              <div
                className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                  serverError ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-primary/30 bg-primary/10 text-slate-200'
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
                        {isUsernameValid && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />}
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
                        ? 'bg-primary text-background-dark hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Отправляем…' : 'Продолжить'}
                  </button>
                  
                  <div className="text-center mt-6">
                    <p className="text-sm text-slate-400">
                      Уже есть аккаунт?{' '}
                      <Link href="/login" className="text-white font-medium hover:text-primary transition-colors">
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
                        className="w-12 h-14 sm:w-14 sm:h-16 bg-slate-800/50 border border-slate-700 rounded-xl text-center text-2xl font-bold text-white focus:border-primary focus:shadow-[0_0_15px_rgba(242,125,38,0.15)] focus:outline-none transition-all disabled:opacity-60"
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => void tryConfirmOtp()}
                    disabled={isConfirming || !/^\d{6}$/.test(otp.join(''))}
                    className={`w-full py-3 rounded-xl font-bold text-base transition-all duration-300 ${
                      !isConfirming && /^\d{6}$/.test(otp.join(''))
                        ? 'bg-primary text-background-dark hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isConfirming ? 'Проверяем…' : 'Подтвердить код'}
                  </button>

                  <div className="pt-2">
                    {timer > 0 ? (
                      <p className="text-sm text-slate-500">
                        Отправить код повторно через <span className="text-primary font-mono">{timer}с</span>
                      </p>
                    ) : (
                      <button
                        onClick={() => void resendCode()}
                        disabled={isResending}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-60"
                      >
                        {isResending ? 'Отправляем…' : 'Отправить код повторно'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: BUSINESS PROFILE */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">О вас</h2>
                    <p className="text-slate-400 text-sm sm:text-base">Расскажите о себе, чтобы привлечь лучших исполнителей</p>
                  </div>

                  <div className="flex items-center gap-6 mb-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="relative w-24 h-24 shrink-0 rounded-full border-2 border-dashed border-slate-600 bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden"
                    >
                      {avatarPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                      )}
                    </button>
                    <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    <div className="text-sm text-slate-400">
                      <p className="font-medium text-white mb-1">Логотип или Фото</p>
                      <p>{avatarPreview ? 'Нажмите для замены' : 'Качественное фото повышает доверие исполнителей'}</p>
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

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Название компании <span className="text-slate-500 font-normal">(Опционально)</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="ООО Ромашка"
                        className={getInputClass(formData.companyName.length > 0, false)}
                      />
                    </div>

                    <Dropdown
                      label="Индустрия"
                      placeholder="Выберите направление бизнеса..."
                      options={industries}
                      value={formData.industry}
                      onChange={(val: string) => setFormData({ ...formData, industry: val })}
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    onClick={handleComplete}
                    disabled={!isStep3Valid || isLoading}
                    className={`w-full py-3.5 rounded-xl font-bold text-base mt-8 transition-all duration-300 relative overflow-hidden group ${
                      isStep3Valid && !isLoading
                        ? 'bg-primary text-background-dark hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isStep3Valid && !isLoading && (
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
