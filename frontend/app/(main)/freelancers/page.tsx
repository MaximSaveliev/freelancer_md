'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, CheckCircle2, Star, Bookmark, MapPin, ChevronDown, 
  LayoutGrid, Award, Wallet, BadgeCheck, ToggleLeft, ToggleRight, Crown, Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock Data
const MOCK_FREELANCERS = [
  {
    id: '1',
    name: 'Александр В.',
    isVerified: true,
    role: 'Senior UI/UX Designer',
    location: 'Кишинев',
    isOnline: true,
    skills: ['FIGMA', 'PROTOTYPING', 'WEB DESIGN'],
    bio: 'Более 8 лет опыта в создании интерфейсов для финтех и e-commerce проектов. Специализируюсь на сложных дизайн-системах и высококонверсионных лендингах.',
    rate: 35,
    projectsCompleted: 128,
    rating: 4.9,
    reviews: 92,
    categoryId: 'design',
    level: 'senior',
    isSaved: false,
    avatar: 'https://picsum.photos/seed/alex/100/100',
    plan: 'premium'
  },
  {
    id: '2',
    name: 'Елена П.',
    isVerified: true,
    role: 'Full-stack Developer',
    location: 'Бельцы',
    isOnline: false,
    skills: ['REACT', 'NODE.JS', 'POSTGRESQL'],
    bio: 'Разработка масштабируемых веб-приложений на современном стеке. Опыт работы с высоконагруженными системами и интеграцией API.',
    rate: 45,
    projectsCompleted: 84,
    rating: 5.0,
    reviews: 45,
    categoryId: 'dev',
    level: 'senior',
    isSaved: false,
    avatar: 'https://picsum.photos/seed/elena/100/100',
    plan: 'pro'
  },
  {
    id: '3',
    name: 'Дмитрий С.',
    isVerified: true,
    role: 'Motion Designer & 3D',
    location: 'Тирасполь',
    isOnline: true,
    skills: ['BLENDER', 'AFTER EFFECTS'],
    bio: 'Создаю эффектные 3D анимации для брендов и мобильных приложений. Работаю над рекламными роликами и презентациями продуктов.',
    rate: 30,
    projectsCompleted: 46,
    rating: 4.8,
    reviews: 31,
    categoryId: 'design',
    level: 'middle',
    isSaved: false,
    avatar: 'https://picsum.photos/seed/dmitry/100/100',
    plan: 'free'
  },
  {
    id: '4',
    name: 'Марина К.',
    isVerified: true,
    role: 'Digital Marketing & SEO',
    location: 'Кишинев',
    isOnline: true,
    skills: ['SEO', 'GOOGLE ADS'],
    bio: 'Комплексное продвижение бизнеса в сети. Вывод сайтов в топ выдачи и настройка эффективных рекламных кампаний.',
    rate: 25,
    projectsCompleted: 212,
    rating: 4.7,
    reviews: 124,
    categoryId: 'marketing',
    level: 'senior',
    isSaved: false,
    avatar: 'https://picsum.photos/seed/marina/100/100',
    plan: 'pro'
  },
  {
    id: '5',
    name: 'Иван М.',
    isVerified: true,
    role: 'Python Developer',
    location: 'Кишинев',
    isOnline: false,
    skills: ['DJANGO', 'FASTAPI'],
    bio: 'Backend-разработчик с упором на производительность и чистый код. Создаю API, парсеры и автоматизирую бизнес-процессы.',
    rate: 40,
    projectsCompleted: 56,
    rating: 4.9,
    reviews: 18,
    categoryId: 'dev',
    level: 'middle',
    isSaved: false,
    avatar: 'https://picsum.photos/seed/ivan/100/100',
    plan: 'free'
  },
  {
    id: '6',
    name: 'Анна Л.',
    isVerified: true,
    role: 'Copywriter & Translator',
    location: 'Кагул',
    isOnline: false,
    skills: ['ENGLISH', 'ROMANIAN', 'RUSSIAN'],
    bio: 'Профессиональный переводчик и копирайтер. Помогаю брендам выходить на международный рынок, адаптируя контент под локальную аудиторию.',
    rate: 20,
    projectsCompleted: 314,
    rating: 5.0,
    reviews: 156,
    categoryId: 'texts',
    level: 'senior',
    isSaved: false,
    avatar: 'https://picsum.photos/seed/anna/100/100',
    plan: 'free'
  },
  {
    id: '7',
    name: 'Виктор К.',
    isVerified: true,
    role: 'Mobile Developer (Flutter)',
    location: 'Кишинев',
    isOnline: true,
    skills: ['FLUTTER', 'DART', 'FIREBASE'],
    bio: 'Разработка кроссплатформенных мобильных приложений. Помогаю стартапам быстро запустить MVP на iOS и Android.',
    rate: 50,
    projectsCompleted: 22,
    rating: 4.9,
    reviews: 14,
    categoryId: 'dev',
    level: 'senior',
    isSaved: false,
    avatar: 'https://picsum.photos/seed/viktor/100/100',
    plan: 'free'
  }
];

const CATEGORIES = [
  { id: 'dev', label: 'Разработка и IT' },
  { id: 'design', label: 'Дизайн и Креатив' },
  { id: 'marketing', label: 'Маркетинг и SMM' },
  { id: 'video', label: 'Фото и Видео' },
  { id: 'texts', label: 'Тексты и Переводы' },
];

const LEVELS = [
  { id: 'junior', label: 'Junior' },
  { id: 'middle', label: 'Middle' },
  { id: 'senior', label: 'Senior' },
];

export default function FreelancersPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isAvailableNow, setIsAvailableNow] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [rateMin, setRateMin] = useState<string>('');
  const [rateMax, setRateMax] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('Все города Молдовы');
  const [sortBy, setSortBy] = useState('По рейтингу');
  
  const [savedFreelancers, setSavedFreelancers] = useState<string[]>(
    MOCK_FREELANCERS.filter(f => f.isSaved).map(f => f.id)
  );

  const toggleSaved = (id: string) => {
    setSavedFreelancers(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleLevel = (id: string) => {
    setSelectedLevels(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  // Filtering Logic
  const filteredFreelancers = MOCK_FREELANCERS.filter(freelancer => {
    // Search
    if (searchQuery && !freelancer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) && !freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) && !freelancer.role.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Available Now
    if (isAvailableNow && !freelancer.isOnline) return false;

    // Categories
    if (selectedCategories.length > 0 && !selectedCategories.includes(freelancer.categoryId)) return false;

    // Levels
    if (selectedLevels.length > 0 && !selectedLevels.includes(freelancer.level)) return false;

    // Minimum Rating
    if (freelancer.rating < minRating) return false;

    // Rate
    if (rateMin && freelancer.rate < parseInt(rateMin)) return false;
    if (rateMax && freelancer.rate > parseInt(rateMax)) return false;

    // Location
    if (selectedLocation !== 'Все города Молдовы' && freelancer.location !== selectedLocation) return false;

    return true;
  }).sort((a, b) => {
    // 1. Sort by Plan (Premium -> PRO -> Free)
    const planOrder = { premium: 3, pro: 2, free: 1 };
    const planA = planOrder[a.plan as keyof typeof planOrder] || 1;
    const planB = planOrder[b.plan as keyof typeof planOrder] || 1;
    
    if (planA !== planB) {
      return planB - planA;
    }

    // 2. Then sort by selected criteria
    if (sortBy === 'По рейтингу') return b.rating - a.rating;
    if (sortBy === 'Ставка (по убыванию)') return b.rate - a.rate;
    if (sortBy === 'Ставка (по возрастанию)') return a.rate - b.rate;
    if (sortBy === 'Больше проектов') return b.projectsCompleted - a.projectsCompleted;
    return 0;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const freelancersPerPage = 5;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchQuery, isAvailableNow, selectedCategories, selectedLevels, minRating, rateMin, rateMax, selectedLocation, sortBy]);

  const totalPages = Math.ceil(filteredFreelancers.length / freelancersPerPage);
  const paginatedFreelancers = filteredFreelancers.slice((currentPage - 1) * freelancersPerPage, currentPage * freelancersPerPage);

  return (
    <div className="min-h-screen bg-background-dark pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Найдите лучших экспертов
          </h1>
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Поиск по навыкам (Photoshop, React, SEO)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-card/50 border border-slate-700 rounded-full pl-12 pr-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-slate-card border border-slate-border rounded-2xl p-6 space-y-8 sticky top-24">
              
              {/* Available Now Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Свободен сейчас</span>
                <button 
                  onClick={() => setIsAvailableNow(!isAvailableNow)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAvailableNow ? 'bg-primary' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailableNow ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="h-px bg-slate-800"></div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  Категории
                </h3>
                <div className="space-y-3">
                  {CATEGORIES.map((category) => (
                    <label key={category.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleCategory(category.id)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(category.id) ? 'bg-primary border-primary' : 'border-slate-600 group-hover:border-slate-400'}`}>
                        {selectedCategories.includes(category.id) && <CheckCircle2 className="w-3.5 h-3.5 text-background-dark" />}
                      </div>
                      <span className={`text-sm ${selectedCategories.includes(category.id) ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                        {category.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Уровень
                </h3>
                <div className="space-y-3">
                  {LEVELS.map((level) => (
                    <label key={level.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleLevel(level.id)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedLevels.includes(level.id) ? 'bg-primary border-primary' : 'border-slate-600 group-hover:border-slate-400'}`}>
                        {selectedLevels.includes(level.id) && <CheckCircle2 className="w-3.5 h-3.5 text-background-dark" />}
                      </div>
                      <span className={`text-sm ${selectedLevels.includes(level.id) ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Минимальный рейтинг
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>0.0</span>
                    <span className="text-primary font-bold">{minRating.toFixed(1)}</span>
                    <span>5.0</span>
                  </div>
                  <div className="relative h-1 bg-slate-700 rounded-full mt-2 mb-4">
                    <div 
                      className="absolute h-full bg-primary rounded-full"
                      style={{ left: 0, right: `${100 - (minRating / 5) * 100}%` }}
                    ></div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      step="0.1"
                      value={minRating} 
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="absolute w-full -top-1.5 h-4 opacity-0 cursor-pointer pointer-events-auto"
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow pointer-events-none"
                      style={{ left: `calc(${(minRating / 5) * 100}% - 8px)` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Rate ($/hour) */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  Ставка ($/час)
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>$5</span>
                    <span>$100+</span>
                  </div>
                  <div className="relative h-1 bg-slate-700 rounded-full mt-6 mb-8">
                    <div 
                      className="absolute h-full bg-primary rounded-full"
                      style={{ 
                        left: `${rateMin ? Math.min((parseInt(rateMin) / 100) * 100, 100) : 0}%`, 
                        right: `${100 - (rateMax ? Math.min((parseInt(rateMax) / 100) * 100, 100) : 100)}%` 
                      }}
                    ></div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      value={rateMin || 0} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const maxVal = rateMax ? parseInt(rateMax) : 100;
                        if (val <= maxVal) setRateMin(val.toString());
                      }}
                      className="absolute w-full -top-1.5 h-4 opacity-0 cursor-pointer pointer-events-auto"
                      style={{ zIndex: rateMin && parseInt(rateMin) > 80 ? 4 : 3 }}
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      value={rateMax || 100} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const minVal = rateMin ? parseInt(rateMin) : 0;
                        if (val >= minVal) setRateMax(val.toString());
                      }}
                      className="absolute w-full -top-1.5 h-4 opacity-0 cursor-pointer pointer-events-auto"
                      style={{ zIndex: 3 }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow pointer-events-none"
                      style={{ left: `calc(${rateMin ? Math.min((parseInt(rateMin) / 100) * 100, 100) : 0}% - 8px)` }}
                    ></div>
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow pointer-events-none"
                      style={{ left: `calc(${rateMax ? Math.min((parseInt(rateMax) / 100) * 100, 100) : 100}% - 8px)` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="От" 
                      min="0"
                      max="100"
                      value={rateMin}
                      onChange={(e) => setRateMin(e.target.value)}
                      className="w-full bg-slate-card/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary outline-none" 
                    />
                    <input 
                      type="number" 
                      placeholder="До" 
                      min="0"
                      max="100"
                      value={rateMax}
                      onChange={(e) => setRateMax(e.target.value)}
                      className="w-full bg-slate-card/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary outline-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Локация
                </h3>
                <div className="relative">
                  <select 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none bg-slate-card/50 border border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Все города Молдовы">Все города Молдовы</option>
                    <option value="Кишинев">Кишинев</option>
                    <option value="Бельцы">Бельцы</option>
                    <option value="Тирасполь">Тирасполь</option>
                    <option value="Кагул">Кагул</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-slate-300 text-sm">
                Найдено <span className="text-white font-bold">{filteredFreelancers.length} эксперта</span>
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Сортировать по:</span>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-slate-card border border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="По рейтингу">По рейтингу</option>
                    <option value="Ставка (по убыванию)">Ставка (по убыванию)</option>
                    <option value="Ставка (по возрастанию)">Ставка (по возрастанию)</option>
                    <option value="Больше проектов">Больше проектов</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Freelancers List */}
            <div className="space-y-4">
              {paginatedFreelancers.length > 0 ? (
                paginatedFreelancers.map((freelancer) => (
                  <motion.div 
                    key={freelancer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-slate-card border rounded-2xl p-6 transition-colors group relative ${
                      freelancer.plan === 'premium' 
                        ? 'border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                        : freelancer.plan === 'pro'
                        ? 'border-primary/30 hover:border-primary/50 shadow-[0_0_15px_rgba(19,200,236,0.05)]'
                        : 'border-slate-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-5 mb-5">
                      <div className="relative shrink-0">
                        <div className={`rounded-full p-0.5 ${
                          freelancer.plan === 'premium' 
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                            : freelancer.plan === 'pro'
                            ? 'bg-gradient-to-br from-primary to-purple-600'
                            : 'bg-transparent'
                        }`}>
                          <Image 
                            src={freelancer.avatar} 
                            alt={freelancer.name} 
                            width={72} 
                            height={72} 
                            className="rounded-full object-cover border-2 border-slate-card"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {freelancer.isOnline && (
                          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-card rounded-full z-10"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors cursor-pointer truncate">
                              {freelancer.name}
                            </h2>
                            {freelancer.isVerified && (
                              <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                            )}
                            {freelancer.plan === 'premium' && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded flex items-center gap-1 uppercase tracking-wider">
                                <Crown className="w-3 h-3" /> Premium
                              </span>
                            )}
                            {freelancer.plan === 'pro' && (
                              <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold rounded flex items-center gap-1 uppercase tracking-wider">
                                <Zap className="w-3 h-3" /> PRO
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => toggleSaved(freelancer.id)}
                            className="text-slate-500 hover:text-primary transition-colors cursor-pointer shrink-0"
                          >
                            <Bookmark className={`w-5 h-5 ${savedFreelancers.includes(freelancer.id) ? 'fill-primary text-primary' : ''}`} />
                          </button>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">
                          {freelancer.role} • {freelancer.location}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-[10px] uppercase tracking-widest text-slate-300 font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 mb-6 line-clamp-2">
                      {freelancer.bio}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-border/50">
                      <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">Ставка</p>
                          <p className="text-lg font-bold text-white">от ${freelancer.rate} <span className="text-sm font-normal text-slate-400">/ час</span></p>
                        </div>
                        <div className="w-px h-8 bg-slate-border hidden sm:block"></div>
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">Проекты</p>
                          <p className="text-sm font-bold text-primary">{freelancer.projectsCompleted} <span className="text-slate-400 font-normal">завершено</span></p>
                        </div>
                        <div className="w-px h-8 bg-slate-border hidden sm:block"></div>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <p className="text-sm font-bold text-white">{freelancer.rating.toFixed(1)}</p>
                          <p className="text-xs text-slate-400">({freelancer.reviews} отзыва)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/freelancers/${freelancer.id}`}
                          className="px-5 py-2 text-sm font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                        >
                          Профиль
                        </Link>
                        <button className="px-5 py-2 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-background-dark shadow-[0_0_15px_rgba(19,200,236,0.3)] transition-all">
                          Пригласить
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-card rounded-2xl border border-slate-border">
                  <p className="text-slate-400">Эксперты не найдены. Попробуйте изменить фильтры.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-card border border-slate-border text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${currentPage === i + 1 ? 'bg-primary text-background-dark font-bold' : 'bg-slate-card border border-slate-border text-slate-400 hover:text-white hover:border-slate-500'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-card border border-slate-border text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
