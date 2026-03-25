'use client';

import { useState, useEffect } from 'react';
import { Mail, Eye, EyeOff, Save, Shield, CheckCircle2, AlertCircle, Lock, Crown, Zap, Code, X } from 'lucide-react';
import { motion } from 'motion/react';
import SubscriptionModal from '@/components/subscription-modal';

export default function SettingsPage() {
  // State for Login Change
  const [currentLogin, setCurrentLogin] = useState('');
  const [newLogin, setNewLogin] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginError, setLoginError] = useState('');

  // State for Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Subscription State
  const [userRole, setUserRole] = useState('freelancer');
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Skills State — each entry has id (skill_id) + name for display
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSkillLoading, setIsSkillLoading] = useState(false);
  const maxSkills = currentPlan === 'free' ? 5 : 10;

  // Load user data + skills + subscription
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'freelancer';
    const email = localStorage.getItem('user_email') || '';
    const userId = localStorage.getItem('user_id') || '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserRole(role);
    if (email) setCurrentLogin(email);

    const loadData = async () => {
      if (!userId) return;
      try {
        const [{ getProfileSkills, listSkills }, { getSubscription }] = await Promise.all([
          import('@/lib/api/bl'),
          import('@/lib/api/payment'),
        ]);
        const [profileSkills, allSkills, sub] = await Promise.all([
          getProfileSkills(userId),
          listSkills(),
          getSubscription(userId).catch(() => null),
        ]);
        const skillMap = new Map(allSkills.map(s => [s.id, s.name]));
        setSkills(profileSkills.map(ps => ({ id: ps.skill_id, name: skillMap.get(ps.skill_id) ?? ps.skill_id })));
        if (sub) {
          const plan = sub.plan as 'free' | 'pro' | 'premium';
          setCurrentPlan(plan);
          localStorage.setItem('userPlan', plan);
        }
      } catch (e) {
        console.error('Failed to load settings data:', e);
      }
    };
    loadData();
  }, []);

  const handleLoginChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    
    if (!newLogin.includes('@')) {
      setLoginError('Пожалуйста, введите корректный email адрес.');
      return;
    }

    setIsLoginLoading(true);
    // Mock API call
    setTimeout(() => {
      setCurrentLogin(newLogin);
      setNewLogin('');
      setLoginSuccess('Логин успешно изменен.');
      setIsLoginLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setLoginSuccess(''), 3000);
    }, 1000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Введите текущий пароль.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Новый пароль должен содержать не менее 8 символов.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают.');
      return;
    }

    setIsPasswordLoading(true);
    // Mock API call
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Пароль успешно изменен.');
      setIsPasswordLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
    }, 1000);
  };

  const handleUpgrade = async (plan: 'pro' | 'premium') => {
    const userId = localStorage.getItem('user_id') || '';
    const email = localStorage.getItem('user_email') || '';
    const name = localStorage.getItem('user_name') || email;
    if (!userId) return;
    try {
      const { createCheckout } = await import('@/lib/api/payment');
      const { checkout_url } = await createCheckout({ user_id: userId, plan, email, name });
      window.location.href = checkout_url;
    } catch (e) {
      console.error('Checkout failed:', e);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSkill.trim().toUpperCase();
    if (!name || skills.length >= maxSkills || skills.some(s => s.name === name)) return;
    const userId = localStorage.getItem('user_id') || '';
    if (!userId) return;
    setIsSkillLoading(true);
    try {
      const { listSkills, createSkill, addProfileSkill } = await import('@/lib/api/bl');
      const found = await listSkills(name);
      const skill = found.find(s => s.name.toUpperCase() === name) ?? await createSkill(name);
      await addProfileSkill(userId, skill.id);
      setSkills(prev => [...prev, { id: skill.id, name: skill.name.toUpperCase() }]);
      setNewSkill('');
    } catch (e) {
      console.error('Failed to add skill:', e);
    } finally {
      setIsSkillLoading(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    const userId = localStorage.getItem('user_id') || '';
    if (!userId) return;
    try {
      const { removeProfileSkill } = await import('@/lib/api/bl');
      await removeProfileSkill(userId, skillId);
      setSkills(prev => prev.filter(s => s.id !== skillId));
    } catch (e) {
      console.error('Failed to remove skill:', e);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Настройки аккаунта</h1>
          <p className="text-slate-400">Управляйте настройками безопасности и личными данными.</p>
        </div>

        <div className="space-y-6">
          {/* Change Login Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-card border border-slate-border rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Изменить логин (Email)</h2>
                <p className="text-sm text-slate-400">Используется для входа в систему и уведомлений.</p>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleLoginChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Текущий логин</label>
                  <input 
                    type="text" 
                    value={currentLogin}
                    disabled
                    className="w-full bg-slate-800/50 border border-slate-border rounded-xl px-4 py-2.5 text-slate-400 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Новый логин</label>
                  <input 
                    type="email" 
                    value={newLogin}
                    onChange={(e) => setNewLogin(e.target.value)}
                    placeholder="Введите новый email"
                    className="w-full bg-background-dark border border-slate-border rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{loginError}</p>
                  </div>
                )}

                {loginSuccess && (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <p>{loginSuccess}</p>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={!newLogin || isLoginLoading}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isLoginLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Сохранить логин
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Change Password Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-card border border-slate-border rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Изменить пароль</h2>
                <p className="text-sm text-slate-400">Обеспечьте безопасность вашей учетной записи.</p>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Текущий пароль</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Введите текущий пароль"
                      className="w-full bg-background-dark border border-slate-border rounded-xl pl-4 pr-12 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Новый пароль</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Минимум 8 символов"
                        className="w-full bg-background-dark border border-slate-border rounded-xl pl-4 pr-12 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Подтвердите пароль</label>
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите новый пароль"
                      className="w-full bg-background-dark border border-slate-border rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <p>{passwordSuccess}</p>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={!currentPassword || !newPassword || !confirmPassword || isPasswordLoading}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isPasswordLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    Обновить пароль
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Subscription Section (Freelancers Only) */}
          {userRole === 'freelancer' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-card border border-slate-border rounded-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Управление подпиской</h2>
                  <p className="text-sm text-slate-400">Расширьте возможности вашего профиля.</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-slate-300 font-medium">Текущий план:</span>
                      {currentPlan === 'free' && (
                        <span className="px-3 py-1 bg-slate-700 text-slate-300 text-sm font-bold rounded-lg">
                          Базовый (Бесплатный)
                        </span>
                      )}
                      {currentPlan === 'pro' && (
                        <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 text-sm font-bold rounded-lg flex items-center gap-1.5">
                          <Zap className="w-4 h-4" /> PRO
                        </span>
                      )}
                      {currentPlan === 'premium' && (
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 text-sm font-bold rounded-lg flex items-center gap-1.5">
                          <Crown className="w-4 h-4" /> Premium
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {currentPlan === 'free' && 'Улучшите свой аккаунт, чтобы получать больше заказов и выделяться среди конкурентов.'}
                      {currentPlan === 'pro' && 'Вы используете профессиональные инструменты. Перейдите на Premium для максимальной конверсии.'}
                      {currentPlan === 'premium' && 'У вас активирован максимальный тариф. Вы получаете все преимущества платформы.'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className={`shrink-0 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                      currentPlan === 'premium' 
                        ? 'bg-slate-800 text-white hover:bg-slate-700' 
                        : 'bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90'
                    }`}
                  >
                    {currentPlan === 'free' ? 'Улучшить аккаунт' : 'Управление планом'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Skills Section (Freelancers Only) */}
          {userRole === 'freelancer' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-card border border-slate-border rounded-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Мои навыки</h2>
                    <p className="text-sm text-slate-400">Добавьте ключевые навыки для поиска проектов.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${skills.length >= maxSkills ? 'text-red-400' : 'text-slate-300'}`}>
                    {skills.length} / {maxSkills}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleAddSkill} className="flex gap-3 mb-6">
                  <input 
                    type="text" 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Например, FIGMA"
                    disabled={skills.length >= maxSkills}
                    className="flex-1 bg-background-dark border border-slate-border rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!newSkill.trim() || skills.length >= maxSkills || isSkillLoading}
                    className="shrink-0 bg-slate-800 text-white px-6 py-2.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-slate-700"
                  >
                    {isSkillLoading ? '...' : 'Добавить'}
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 font-medium flex items-center gap-2"
                    >
                      {skill.name}
                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-sm text-slate-500 italic">Навыки не добавлены</p>
                  )}
                </div>

                {skills.length >= maxSkills && currentPlan === 'free' && (
                  <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3">
                    <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Достигнут лимит навыков</p>
                      <p className="text-xs text-slate-400 mb-3">
                        На бесплатном тарифе можно добавить только 5 навыков. Перейдите на PRO или Premium, чтобы добавить до 10 навыков и получать больше релевантных заказов.
                      </p>
                      <button 
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        className="text-xs font-bold bg-primary text-background-dark px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                      >
                        Увеличить лимит
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentPlan={currentPlan}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
