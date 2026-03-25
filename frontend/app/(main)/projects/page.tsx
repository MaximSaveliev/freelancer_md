'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, CheckCircle2, Clock, Users, 
  Bookmark, Star, ChevronDown, Filter, ShieldCheck, Zap,
  LayoutGrid, Wallet, CreditCard, Award, X, Gavel
} from 'lucide-react';
import Link from 'next/link';

import type { Project as BLProject, Category as BLCategory } from '@/lib/types';

function mapBLProject(p: BLProject) {
  const budgetMin = p.budget.amount ?? p.budget.min ?? 0;
  const budgetMax = p.budget.amount ?? p.budget.max ?? budgetMin;
  const paymentType = p.payment_type.toLowerCase();
  const deadline = p.is_urgent ? 'urgent' : 'long';
  const experienceLevel = p.required_grade?.toLowerCase() ?? '';
  const createdAt = new Date(p.created_at);
  const isNew = Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000;
  const budgetStr = paymentType === 'auction'
    ? 'Аукцион'
    : paymentType === 'hourly'
    ? `$${budgetMin} / час`
    : budgetMin === budgetMax
    ? `$${budgetMin}`
    : `$${budgetMin} - $${budgetMax}`;
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    postedAt: createdAt.toLocaleDateString('ru-RU'),
    applicants: p.bid_count,
    paymentVerified: false,
    budget: budgetStr,
    budgetMin,
    budgetMax,
    tags: [] as string[],
    rating: 0,
    reviews: 0,
    isSaved: false,
    isPromoted: false,
    categoryId: p.category_id ?? '',
    paymentType,
    deadline,
    experienceLevel,
    isEscrowReady: false,
    isNew,
    isAuction: p.payment_type === 'AUCTION',
    avgBid: p.avg_bid,
  };
}

const CATEGORIES = [
  { id: 'dev', label: 'Разработка и IT' },
  { id: 'design', label: 'Дизайн и Креатив' },
  { id: 'marketing', label: 'Маркетинг и SMM' },
  { id: 'photo', label: 'Фото, Видео и Дроны' },
  { id: 'texts', label: 'Тексты и Переводы' },
];

const PAYMENT_TYPES = [
  { id: 'fixed', label: 'Фиксированная' },
  { id: 'hourly', label: 'Почасовая' },
  { id: 'auction', label: 'Аукцион' },
];

const DEADLINES = [
  { id: 'urgent', label: 'Срочно (до 24ч)' },
  { id: 'short', label: '1-3 дня' },
  { id: 'long', label: 'Неделя+' },
];

const EXPERIENCE_LEVELS = [
  { id: 'junior', label: 'Junior' },
  { id: 'middle', label: 'Middle' },
  { id: 'senior', label: 'Senior' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ReturnType<typeof mapBLProject>[]>([]);
  const [categories, setCategories] = useState<BLCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { listProjects, listCategories } = await import('@/lib/api/bl');
        const [blProjects, blCategories] = await Promise.all([
          listProjects({ status: 'OPEN', limit: 50 }),
          listCategories(),
        ]);
        setProjects(blProjects.map(mapBLProject));
        setCategories(blCategories);
      } catch (e) {
        console.error('Failed to load projects:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [selectedDeadlines, setSelectedDeadlines] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Рекомендуемые');

  const [quickFilters, setQuickFilters] = useState({
    verified: false,
    escrow: false,
    newToday: false,
    noCompetition: false,
  });

  const [savedProjects, setSavedProjects] = useState<string[]>([]);

  const toggleSaved = (id: string) => {
    setSavedProjects(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleDeadline = (id: string) => {
    setSelectedDeadlines(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleExperienceLevel = (id: string) => {
    setSelectedExperienceLevels(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleQuickFilter = (key: keyof typeof quickFilters) => {
    setQuickFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredProjects = projects.filter(project => {
    // Search Query
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) && !project.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Categories
    if (selectedCategories.length > 0 && !selectedCategories.includes(project.categoryId)) {
      return false;
    }

    // Budget
    if (budgetMin && project.budgetMax < parseInt(budgetMin)) {
      return false;
    }
    if (budgetMax && project.budgetMin > parseInt(budgetMax)) {
      return false;
    }

    // Payment Type
    if (selectedPaymentType && project.paymentType !== selectedPaymentType) {
      return false;
    }

    // Deadlines
    if (selectedDeadlines.length > 0 && !selectedDeadlines.includes(project.deadline)) {
      return false;
    }

    // Experience Levels
    if (selectedExperienceLevels.length > 0 && !selectedExperienceLevels.includes(project.experienceLevel)) {
      return false;
    }

    // Quick Filters
    if (quickFilters.verified && !project.paymentVerified) return false;
    if (quickFilters.escrow && !project.isEscrowReady) return false;
    if (quickFilters.newToday && !project.isNew) return false;
    if (quickFilters.noCompetition && project.applicants >= 5) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'Сначала новые') {
      return b.isNew ? 1 : -1;
    }
    if (sortBy === 'Бюджет (по убыванию)') {
      return b.budgetMax - a.budgetMax;
    }
    if (sortBy === 'Бюджет (по возрастанию)') {
      return a.budgetMin - b.budgetMin;
    }
    // 'Рекомендуемые'
    if (a.isPromoted && !b.isPromoted) return -1;
    if (!a.isPromoted && b.isPromoted) return 1;
    return 0;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [auctionForm, setAuctionForm] = useState({ price: '', timeframe: '', coverLetter: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const projectsPerPage = 5;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, budgetMin, budgetMax, selectedPaymentType, selectedDeadlines, selectedExperienceLevels, quickFilters, sortBy]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

  const handleAuctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedAuction(null);
        setAuctionForm({ price: '', timeframe: '', coverLetter: '' });
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background-dark pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
            Найдите идеальный проект
          </h1>
          
          {/* Search Bar */}
          <div className="w-full max-w-3xl relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-12 pr-4 py-4 bg-slate-card/50 border border-slate-border rounded-2xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-lg shadow-lg" 
              placeholder="Поиск проектов (например, лендинг, логотип)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => toggleQuickFilter('verified')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer ${quickFilters.verified ? 'bg-primary/20 border-primary text-white' : 'bg-slate-800/50 border-slate-700 hover:border-primary/50 text-slate-300 hover:text-white'}`}
            >
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Верифицированные
            </button>
            <button 
              onClick={() => toggleQuickFilter('escrow')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer ${quickFilters.escrow ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-slate-800/50 border-slate-700 hover:border-primary/50 text-slate-300 hover:text-white'}`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Эскроу готов
            </button>
            <button 
              onClick={() => toggleQuickFilter('newToday')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer ${quickFilters.newToday ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-slate-800/50 border-slate-700 hover:border-primary/50 text-slate-300 hover:text-white'}`}
            >
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Новые сегодня
            </button>
            <button 
              onClick={() => toggleQuickFilter('noCompetition')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer ${quickFilters.noCompetition ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-slate-800/50 border-slate-700 hover:border-primary/50 text-slate-300 hover:text-white'}`}
            >
              <Zap className="w-4 h-4 text-purple-500" />
              Без конкуренции
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-slate-card border border-slate-border rounded-xl text-white font-medium"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <Filter className="w-5 h-5" />
            Фильтры
          </button>

          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-64 shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-8 sticky top-28">
              
              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  Категории
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleCategory(cat.id)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat.id) ? 'bg-primary border-primary' : 'border-slate-600 group-hover:border-slate-400'}`}>
                        {selectedCategories.includes(cat.id) && <CheckCircle2 className="w-3.5 h-3.5 text-background-dark" />}
                      </div>
                      <span className={`text-sm ${selectedCategories.includes(cat.id) ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  Бюджет
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>$0</span>
                    <span>$5000+</span>
                  </div>
                  {/* Custom Range Slider Visual */}
                  <div className="relative h-1 bg-slate-700 rounded-full mt-6 mb-8">
                    <div 
                      className="absolute h-full bg-primary rounded-full"
                      style={{ 
                        left: `${budgetMin ? Math.min((parseInt(budgetMin) / 5000) * 100, 100) : 0}%`, 
                        right: `${100 - (budgetMax ? Math.min((parseInt(budgetMax) / 5000) * 100, 100) : 100)}%` 
                      }}
                    ></div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      step="10"
                      value={budgetMin || 0} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const maxVal = budgetMax ? parseInt(budgetMax) : 5000;
                        if (val <= maxVal) setBudgetMin(val.toString());
                      }}
                      className="absolute w-full -top-1.5 h-4 opacity-0 cursor-pointer pointer-events-auto"
                      style={{ zIndex: budgetMin && parseInt(budgetMin) > 4000 ? 4 : 3 }}
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      step="10"
                      value={budgetMax || 5000} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const minVal = budgetMin ? parseInt(budgetMin) : 0;
                        if (val >= minVal) setBudgetMax(val.toString());
                      }}
                      className="absolute w-full -top-1.5 h-4 opacity-0 cursor-pointer pointer-events-auto"
                      style={{ zIndex: 3 }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow pointer-events-none"
                      style={{ left: `calc(${budgetMin ? Math.min((parseInt(budgetMin) / 5000) * 100, 100) : 0}% - 8px)` }}
                    ></div>
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow pointer-events-none"
                      style={{ left: `calc(${budgetMax ? Math.min((parseInt(budgetMax) / 5000) * 100, 100) : 100}% - 8px)` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="От" 
                      min="0"
                      max="5000"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="w-full bg-slate-card/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary outline-none" 
                    />
                    <input 
                      type="number" 
                      placeholder="До" 
                      min="0"
                      max="5000"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="w-full bg-slate-card/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary outline-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Payment Type */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Тип оплаты
                </h3>
                <div className="space-y-2">
                  {PAYMENT_TYPES.map((type) => (
                    <label 
                      key={type.id} 
                      className={`flex items-center gap-3 cursor-pointer group p-2 rounded-lg transition-colors border ${selectedPaymentType === type.id ? 'bg-slate-800 border-slate-700' : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700'}`}
                      onClick={() => setSelectedPaymentType(selectedPaymentType === type.id ? null : type.id)}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPaymentType === type.id ? 'border-primary' : 'border-slate-600 group-hover:border-slate-400'}`}>
                        {selectedPaymentType === type.id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                      </div>
                      <span className={`text-sm ${selectedPaymentType === type.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Срок выполнения
                </h3>
                <div className="space-y-3">
                  {DEADLINES.map((deadline) => (
                    <label key={deadline.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleDeadline(deadline.id)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedDeadlines.includes(deadline.id) ? 'bg-primary border-primary' : 'border-slate-600 group-hover:border-slate-400'}`}>
                        {selectedDeadlines.includes(deadline.id) && <CheckCircle2 className="w-3.5 h-3.5 text-background-dark" />}
                      </div>
                      <span className={`text-sm ${selectedDeadlines.includes(deadline.id) ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{deadline.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Уровень опыта
                </h3>
                <div className="space-y-3">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <label key={level.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleExperienceLevel(level.id)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedExperienceLevels.includes(level.id) ? 'bg-primary border-primary' : 'border-slate-600 group-hover:border-slate-400'}`}>
                        {selectedExperienceLevels.includes(level.id) && <CheckCircle2 className="w-3.5 h-3.5 text-background-dark" />}
                      </div>
                      <span className={`text-sm ${selectedExperienceLevels.includes(level.id) ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-slate-300 text-sm">
                Найдено <span className="text-white font-bold">{filteredProjects.length} проектов</span>
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Сортировать по:</span>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-slate-card border border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Рекомендуемые">Рекомендуемые</option>
                    <option value="Сначала новые">Сначала новые</option>
                    <option value="Бюджет (по убыванию)">Бюджет (по убыванию)</option>
                    <option value="Бюджет (по возрастанию)">Бюджет (по возрастанию)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {paginatedProjects.length > 0 ? (
                paginatedProjects.map((project) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-card border border-slate-border rounded-2xl p-6 hover:border-slate-600 transition-colors group relative"
                >
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors cursor-pointer mb-2 flex items-center gap-2">
                        {project.title}
                        {project.isAuction && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-medium border border-purple-500/30">
                            <Gavel className="w-3 h-3" />
                            Аукцион
                          </span>
                        )}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {project.postedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {project.applicants} откликов
                        </span>
                        {project.paymentVerified ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Оплата верифицирована
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-500">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Оплата не верифицирована
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSaved(project.id)}
                      className="text-slate-500 hover:text-primary transition-colors cursor-pointer shrink-0"
                    >
                      <Bookmark className={`w-5 h-5 ${savedProjects.includes(project.id) ? 'fill-primary text-primary' : ''}`} />
                    </button>
                  </div>

                  <p className="text-sm text-slate-300 mb-6 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-border/50">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">Бюджет</p>
                        <p className="text-lg font-bold text-white">{project.budget}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-border"></div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(project.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-700 text-slate-700'}`} />
                          ))}
                        </div>
                        <p className="text-sm font-bold text-white">{project.rating.toFixed(1)}</p>
                        <p className="text-xs text-slate-400">({project.reviews} отзывов)</p>
                      </div>
                    </div>
                    <Link 
                      href={`/projects/${project.id}`}
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-colors text-center cursor-pointer ${
                        project.isPromoted 
                          ? 'bg-primary hover:bg-primary/90 text-background-dark shadow-[0_0_15px_rgba(19,200,236,0.3)]' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      Посмотреть проект
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-card rounded-2xl border border-slate-border">
                <p className="text-slate-400">Проекты не найдены. Попробуйте изменить фильтры.</p>
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

      {/* Auction Modal */}
      <AnimatePresence>
        {selectedAuction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
              onClick={() => !isSubmitting && !showSuccess && setSelectedAuction(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-card border border-slate-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {showSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Предложение отправлено!</h3>
                  <p className="text-slate-400">Заказчик получит уведомление о вашей ставке.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-slate-border/50">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-purple-400" />
                        Сделать предложение
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-1">{selectedAuction.title}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedAuction(null)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 bg-slate-800/30 border-b border-slate-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Ожидаемый бюджет заказчика</p>
                      <p className="text-lg font-bold text-white">${selectedAuction.budgetMin} - ${selectedAuction.budgetMax}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Конкуренция</p>
                      <p className="text-sm font-medium text-slate-300 flex items-center justify-end gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        Подано {selectedAuction.applicants} заявок
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAuctionSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Моя цена ($)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                          <input 
                            type="number" 
                            required
                            min="1"
                            value={auctionForm.price}
                            onChange={(e) => setAuctionForm({...auctionForm, price: e.target.value})}
                            className="w-full bg-background-dark border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                            placeholder="Например: 1200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Срок (дней)</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="number" 
                            required
                            min="1"
                            value={auctionForm.timeframe}
                            onChange={(e) => setAuctionForm({...auctionForm, timeframe: e.target.value})}
                            className="w-full bg-background-dark border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                            placeholder="Например: 5"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Сопроводительное письмо</label>
                      <textarea 
                        required
                        rows={4}
                        value={auctionForm.coverLetter}
                        onChange={(e) => setAuctionForm({...auctionForm, coverLetter: e.target.value})}
                        className="w-full bg-background-dark border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
                        placeholder="Почему именно вы подходите для этого проекта? Опишите ваш опыт и подход к задаче..."
                      ></textarea>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>Отправить предложение</>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
