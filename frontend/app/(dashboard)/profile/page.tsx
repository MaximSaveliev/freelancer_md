'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Star, 
  Clock, 
  Award, 
  CheckCircle2, 
  Briefcase, 
  Pencil, 
  Plus,
  X,
  Check,
  User,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  // Mock state for editable fields
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [availability, setAvailability] = useState<{ free: string[], busy: string[] }>({
    free: [],
    busy: []
  });

  // Initialize with some mock data for current month
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const format = (d: number) => `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailability({
      free: [format(1), format(2), format(5), format(6), format(9)],
      busy: [format(7), format(8)]
    });
  }, []);

  const toggleAvailability = (dateStr: string) => {
    if (!isEditingAvailability) return;
    
    setAvailability(prev => {
      const isFree = prev.free.includes(dateStr);
      const isBusy = prev.busy.includes(dateStr);

      if (isFree) {
        // If free, make it busy
        return {
          free: prev.free.filter(d => d !== dateStr),
          busy: [...prev.busy, dateStr]
        };
      } else if (isBusy) {
        // If busy, clear it
        return {
          free: prev.free,
          busy: prev.busy.filter(d => d !== dateStr)
        };
      } else {
        // If clear, make it free
        return {
          free: [...prev.free, dateStr],
          busy: prev.busy
        };
      }
    });
  };

  const [profileData, setProfileData] = useState({
    name: 'Искандер Эйви',
    title: 'Дизайн и Креатив',
    location: 'Кишинёв, Молдова 🇲🇩',
    hourlyRate: 35,
    projectRate: 250,
    about: 'Привет! Я Искандер, UI/UX дизайнер с более чем 5-летним опытом создания интуитивно понятных и визуально привлекательных цифровых продуктов. Моя страсть — превращать сложные идеи в простые и элегантные решения, которые помогают бизнесу расти.\n\nЯ специализируюсь на дизайне веб-сайтов, мобильных приложений и создании дизайн-систем. Мой подход основан на глубоком понимании потребностей пользователей и целей бизнеса. Я верю, что хороший дизайн — это не только красивая картинка, но и продуманная логика.',
    tags: ['UI/UX Дизайн', 'Лендинги', 'Мобильные приложения', 'SaaS Продукты', 'Прототипирование'],
    skills: [
      { name: 'Figma', level: 'Advanced', color: 'bg-green-500/10 text-green-400' },
      { name: 'Adobe XD', level: 'Expert', color: 'bg-blue-500/10 text-blue-400' },
      { name: 'Photoshop', level: 'Intermediate', color: 'bg-purple-500/10 text-purple-400' },
      { name: 'Webflow', level: 'Advanced', color: 'bg-indigo-500/10 text-indigo-400' }
    ],
    portfolioCategories: ['Web', 'Mobile', 'Identity'],
    portfolioItems: [
      { id: 1, title: 'FinTech Dashboard', category: 'Web', img: 'https://picsum.photos/seed/p1/400/300', description: 'Разработка дашборда для финтех-стартапа. Включает в себя аналитику, управление счетами и переводы.' },
      { id: 2, title: 'Health Tracker App', category: 'Mobile', img: 'https://picsum.photos/seed/p2/400/300', description: 'Мобильное приложение для отслеживания здоровья и активности. Интеграция с Apple Health и Google Fit.' },
      { id: 3, title: 'Agency Landing Page', category: 'Web', img: 'https://picsum.photos/seed/p3/400/300', description: 'Корпоративный сайт для креативного агентства с анимациями и нестандартной сеткой.' },
      { id: 4, title: 'Shopify Store Redesign', category: 'Web', img: 'https://picsum.photos/seed/p4/400/300', description: 'Редизайн интернет-магазина на Shopify. Увеличение конверсии на 25% за счет улучшения UX.' },
    ]
  });

  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isViewingItem, setIsViewingItem] = useState<any>(null);

  const handleSaveHeader = () => setIsEditingHeader(false);
  const handleSaveAbout = () => setIsEditingAbout(false);
  const handleSaveSkills = () => setIsEditingSkills(false);
  const handleSaveAvailability = () => setIsEditingAvailability(false);

  // Portfolio Handlers
  const handleAddCategory = () => {
    if (newCategoryName.trim() && !profileData.portfolioCategories.includes(newCategoryName.trim())) {
      setProfileData({
        ...profileData,
        portfolioCategories: [...profileData.portfolioCategories, newCategoryName.trim()]
      });
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    setProfileData({
      ...profileData,
      portfolioCategories: profileData.portfolioCategories.filter(c => c !== cat),
      // Optionally reassign items to 'Все' or keep them but they won't show in filters
      portfolioItems: profileData.portfolioItems.map(item => 
        item.category === cat ? { ...item, category: 'Без категории' } : item
      )
    });
    if (selectedCategory === cat) setSelectedCategory('Все');
  };

  const handleSavePortfolioItem = () => {
    if (editingItem.id) {
      // Update existing
      setProfileData({
        ...profileData,
        portfolioItems: profileData.portfolioItems.map(item => 
          item.id === editingItem.id ? editingItem : item
        )
      });
    } else {
      // Add new
      setProfileData({
        ...profileData,
        portfolioItems: [...profileData.portfolioItems, { ...editingItem, id: Date.now() }]
      });
    }
    setEditingItem(null);
  };

  const handleDeletePortfolioItem = (id: number) => {
    setProfileData({
      ...profileData,
      portfolioItems: profileData.portfolioItems.filter(item => item.id !== id)
    });
    setEditingItem(null);
  };

  const filteredPortfolio = selectedCategory === 'Все' 
    ? profileData.portfolioItems 
    : profileData.portfolioItems.filter(item => item.category === selectedCategory);

  // Calendar generation logic
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const generateCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Adjust for Monday as first day of week (0 = Monday, 6 = Sunday)
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      days.push({
        date: d,
        dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: true
      });
    }
    
    // Next month days to fill the grid (up to 42 days for 6 rows)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({
        date: i,
        dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const currentMonthDays = generateCalendar(currentYear, currentMonth);
  const nextMonthDays = generateCalendar(currentMonth === 11 ? currentYear + 1 : currentYear, currentMonth === 11 ? 0 : currentMonth + 1);
  
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/freelancers" className="hover:text-white transition-colors">Фрилансеры</Link>
        <span>›</span>
        <Link href="/freelancers/design" className="hover:text-white transition-colors">Дизайн</Link>
        <span>›</span>
        <span className="text-white font-medium">{profileData.name}</span>
      </div>

      {/* Top Header Block */}
      <div className="bg-slate-card border border-slate-border rounded-2xl p-6 lg:p-8 mb-6 relative group flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
        <button 
          onClick={() => setIsEditingHeader(!isEditingHeader)}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
        >
          {isEditingHeader ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
        </button>

        {/* Left Side: Avatar & Info */}
        <div className="flex flex-col sm:flex-row gap-6 items-start w-full lg:w-auto">
          <div className="relative shrink-0">
            <Image 
              src="https://picsum.photos/seed/avatar/150/150" 
              alt="Avatar" 
              width={120} 
              height={120} 
              className="rounded-full border-4 border-slate-800 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-slate-card rounded-full"></div>
          </div>
          
          <div className="flex-1 w-full">
            {isEditingHeader ? (
              <div className="space-y-4 max-w-md">
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-2xl"
                />
                <div className="relative">
                  <select 
                    value={profileData.title}
                    onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="Разработка и IT">Разработка и IT</option>
                    <option value="Дизайн и Креатив">Дизайн и Креатив</option>
                    <option value="Маркетинг и SMM">Маркетинг и SMM</option>
                    <option value="Фото, Видео и Дроны">Фото, Видео и Дроны</option>
                    <option value="Тексты и Переводы">Тексты и Переводы</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <input 
                  type="text" 
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300"
                />
                <button onClick={handleSaveHeader} className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 w-fit">
                  <Check className="w-4 h-4" /> Сохранить
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{profileData.name}</h1>
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <p className="text-slate-300 text-lg mb-4">{profileData.title}</p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-white">4.9</span>
                    <span>(128 отзывов)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Отвечает быстро</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-0.5 rounded-md font-semibold text-xs border border-primary/20">
                    <Award className="w-3 h-3" />
                    TOP RATED
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-6">
                  <MapPin className="w-4 h-4" />
                  {profileData.location}
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Доступен сейчас
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Rates & Stats */}
        <div className="w-full lg:w-auto lg:min-w-[300px] border-t lg:border-t-0 lg:border-l border-slate-border pt-6 lg:pt-0 lg:pl-8">
          {isEditingHeader ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Почасовая ставка ($)</label>
                <input 
                  type="number" 
                  value={profileData.hourlyRate}
                  onChange={(e) => setProfileData({...profileData, hourlyRate: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Проект от ($)</label>
                <input 
                  type="number" 
                  value={profileData.projectRate}
                  onChange={(e) => setProfileData({...profileData, projectRate: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Почасовая</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${profileData.hourlyRate}</span>
                    <span className="text-sm text-slate-500">/час</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">Проект</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-slate-500">от</span>
                    <span className="text-xl font-bold text-white">${profileData.projectRate}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">96%</p>
                    <p className="text-xs text-slate-400">Вовремя</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">214</p>
                    <p className="text-xs text-slate-400">Работ</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 relative group">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">Обо мне</h2>
            </div>
            
            <button 
              onClick={() => setIsEditingAbout(!isEditingAbout)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              {isEditingAbout ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>

            {isEditingAbout ? (
              <div className="space-y-4">
                <textarea 
                  value={profileData.about}
                  onChange={(e) => setProfileData({...profileData, about: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 min-h-[150px]"
                />
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Теги (через запятую)</label>
                  <input 
                    type="text" 
                    value={profileData.tags.join(', ')}
                    onChange={(e) => setProfileData({...profileData, tags: e.target.value.split(',').map(t => t.trim())})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-300"
                  />
                </div>
                <button onClick={handleSaveAbout} className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" /> Сохранить
                </button>
              </div>
            ) : (
              <>
                <div className="text-slate-300 text-sm leading-relaxed space-y-4 whitespace-pre-wrap mb-6">
                  {profileData.about}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Skills & Tools */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 relative group">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">Навыки и инструменты</h2>
            </div>

            <button 
              onClick={() => setIsEditingSkills(!isEditingSkills)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              {isEditingSkills ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>

            {isEditingSkills ? (
              <div className="space-y-4">
                {profileData.skills.map((skill, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      value={skill.name}
                      onChange={(e) => {
                        const newSkills = [...profileData.skills];
                        newSkills[idx].name = e.target.value;
                        setProfileData({...profileData, skills: newSkills});
                      }}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm"
                    />
                    <select 
                      value={skill.level}
                      onChange={(e) => {
                        const newSkills = [...profileData.skills];
                        newSkills[idx].level = e.target.value;
                        setProfileData({...profileData, skills: newSkills});
                      }}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <button 
                      onClick={() => {
                        const newSkills = profileData.skills.filter((_, i) => i !== idx);
                        setProfileData({...profileData, skills: newSkills});
                      }}
                      className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setProfileData({...profileData, skills: [...profileData.skills, { name: 'New Skill', level: 'Intermediate', color: 'bg-slate-800 text-slate-300' }]})}
                  className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-400 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Добавить навык
                </button>
                <button onClick={handleSaveSkills} className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" /> Сохранить
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileData.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        {skill.name.substring(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-white">{skill.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${skill.color}`}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-white">Портфолио</h2>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => setIsEditingCategories(true)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  title="Управление категориями"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setEditingItem({ title: '', category: profileData.portfolioCategories[0] || 'Web', img: 'https://picsum.photos/seed/new/400/300', description: '' })}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  title="Добавить работу"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setSelectedCategory('Все')}
                className={`px-4 py-1.5 font-bold rounded-full text-sm whitespace-nowrap transition-colors ${selectedCategory === 'Все' ? 'bg-primary text-background-dark' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
              >
                Все
              </button>
              {profileData.portfolioCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 font-bold rounded-full text-sm whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-primary text-background-dark' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPortfolio.map((project) => (
                <div key={project.id} className="group/item relative rounded-xl overflow-hidden border border-slate-border bg-slate-800/50 cursor-pointer" onClick={() => setIsViewingItem(project)}>
                  <div className="aspect-[4/3] relative">
                    <Image src={project.img} alt={project.title} fill className="object-cover group-hover/item:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(project); }}
                        className="w-8 h-8 rounded-full bg-slate-800/80 backdrop-blur flex items-center justify-center text-white hover:bg-primary hover:text-background-dark transition-colors absolute top-4 right-4"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-1">{project.title}</h3>
                    <p className="text-xs text-slate-400">{project.category}</p>
                  </div>
                </div>
              ))}
              {filteredPortfolio.length === 0 && (
                <div className="col-span-1 sm:col-span-2 text-center py-8 text-slate-400">
                  В этой категории пока нет работ.
                </div>
              )}
            </div>
            
            {filteredPortfolio.length > 4 && (
              <button className="w-full mt-6 py-3 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium">
                Показать еще работы
              </button>
            )}
          </div>

          {/* Reviews (Read Only) */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">Отзывы клиентов</h2>
            </div>

            <div className="space-y-6">
              {[
                { name: 'Дмитрий Волков', role: 'CEO, TechStart Ltd', text: '"Искандер проделал потрясающую работу над редизайном нашего приложения. Он не просто нарисовал красивые макеты, но и продумал пользовательский путь. Конверсия выросла на 25% после запуска. Рекомендую!"', project: 'Redesign Mobile App', time: '3 недели назад', rating: 5 },
                { name: 'Анна Петрова', role: 'Marketing Director', text: '"Отличный специалист. Все выполнено в срок, коммуникация на высшем уровне. Очень довольны результатом лендинга."', project: 'Landing Page for Event', time: '1 месяц назад', rating: 5 },
              ].map((review, idx) => (
                <div key={idx} className={idx !== 0 ? "pt-6 border-t border-slate-border" : ""}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <Image src={`https://picsum.photos/seed/user${idx}/40/40`} alt={review.name} width={40} height={40} className="rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-white text-sm">{review.name}</h4>
                        <p className="text-xs text-slate-400">{review.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 italic mb-3 leading-relaxed">{review.text}</p>
                  <p className="text-xs text-slate-500">Проект: {review.project} • {review.time}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* Availability Calendar */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 relative group">
            <button 
              onClick={() => isEditingAvailability ? handleSaveAvailability() : setIsEditingAvailability(true)}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-all z-10 ${
                isEditingAvailability 
                  ? 'bg-primary text-background-dark font-bold px-3 py-1.5 flex items-center gap-1.5 text-sm opacity-100' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 opacity-0 group-hover:opacity-100'
              }`}
            >
              {isEditingAvailability ? (
                <>
                  <Check className="w-4 h-4" /> Сохранить
                </>
              ) : (
                <Pencil className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-bold text-white">Доступность</h2>
            </div>

            <div className="space-y-6">
              {/* Current Month */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3 text-center">{monthNames[currentMonth]} {currentYear}</h3>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="text-xs font-medium text-slate-500 mb-1">{day}</div>
                  ))}
                  
                  {currentMonthDays.map((dayObj, idx) => {
                    const isFree = availability.free.includes(dayObj.dateStr);
                    const isBusy = availability.busy.includes(dayObj.dateStr);
                    
                    return (
                      <button 
                        key={idx} 
                        onClick={() => toggleAvailability(dayObj.dateStr)}
                        disabled={!isEditingAvailability}
                        className={`
                          w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium transition-colors
                          ${isEditingAvailability ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                          ${!dayObj.isCurrentMonth ? 'opacity-30' : ''}
                          ${isFree ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
                          ${isBusy ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                          ${!isFree && !isBusy ? 'text-slate-400' : ''}
                          ${!isFree && !isBusy && isEditingAvailability ? 'hover:bg-slate-800' : ''}
                        `}
                      >
                        {dayObj.date}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Next Month */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3 text-center">{monthNames[currentMonth === 11 ? 0 : currentMonth + 1]} {currentMonth === 11 ? currentYear + 1 : currentYear}</h3>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="text-xs font-medium text-slate-500 mb-1">{day}</div>
                  ))}
                  
                  {nextMonthDays.map((dayObj, idx) => {
                    const isFree = availability.free.includes(dayObj.dateStr);
                    const isBusy = availability.busy.includes(dayObj.dateStr);
                    
                    return (
                      <button 
                        key={idx} 
                        onClick={() => toggleAvailability(dayObj.dateStr)}
                        disabled={!isEditingAvailability}
                        className={`
                          w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium transition-colors
                          ${isEditingAvailability ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                          ${!dayObj.isCurrentMonth ? 'opacity-30' : ''}
                          ${isFree ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
                          ${isBusy ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                          ${!isFree && !isBusy ? 'text-slate-400' : ''}
                          ${!isFree && !isBusy && isEditingAvailability ? 'hover:bg-slate-800' : ''}
                        `}
                      >
                        {dayObj.date}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 text-xs mt-6">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Свободен
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Занят
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      
      {/* Edit Categories Modal */}
      {isEditingCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
          <div className="bg-slate-card border border-slate-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-white">Управление категориями</h3>
              <button onClick={() => setIsEditingCategories(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Существующие категории</h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.portfolioCategories.map(cat => (
                    <div key={cat} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full text-sm text-slate-300 border border-slate-700">
                      <span>{cat}</span>
                      <button onClick={() => handleDeleteCategory(cat)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {profileData.portfolioCategories.length === 0 && (
                    <span className="text-sm text-slate-500">Нет категорий</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Добавить новую</h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Название категории"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button 
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end">
              <button onClick={() => setIsEditingCategories(false)} className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg">
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Portfolio Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-card border border-slate-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-white">{editingItem.id ? 'Редактировать работу' : 'Добавить работу'}</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Название проекта</label>
                <input 
                  type="text" 
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="Например: FinTech Dashboard"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Категория</label>
                <div className="relative">
                  <select 
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    {profileData.portfolioCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {profileData.portfolioCategories.length === 0 && (
                      <option value="Без категории">Без категории</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">URL Изображения (Обложка)</label>
                <input 
                  type="text" 
                  value={editingItem.img}
                  onChange={(e) => setEditingItem({...editingItem, img: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="https://..."
                />
                {editingItem.img && (
                  <div className="mt-3 h-40 relative rounded-lg overflow-hidden border border-slate-700">
                    <Image src={editingItem.img} alt="Preview" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Описание проекта</label>
                <textarea 
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-y"
                  placeholder="Опишите задачу, процесс и результат..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
              {editingItem.id ? (
                <button onClick={() => handleDeletePortfolioItem(editingItem.id)} className="text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 transition-colors">
                  Удалить работу
                </button>
              ) : (
                <div></div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium">
                  Отмена
                </button>
                <button 
                  onClick={handleSavePortfolioItem} 
                  disabled={!editingItem.title.trim()}
                  className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Portfolio Item Modal */}
      {isViewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm overflow-y-auto" onClick={() => setIsViewingItem(null)}>
          <div className="bg-slate-card border border-slate-border rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-8" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-video w-full bg-slate-900 border-b border-slate-800">
              <Image src={isViewingItem.img} alt={isViewingItem.title} fill className="object-contain" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setIsViewingItem(null)} 
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{isViewingItem.title}</h2>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {isViewingItem.category}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setEditingItem(isViewingItem);
                    setIsViewingItem(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-sm font-medium">Редактировать</span>
                </button>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-bold text-white mb-3">О проекте</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {isViewingItem.description || 'Описание не добавлено.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
