'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MapPin, Star, Clock, Award, CheckCircle2, Briefcase, Pencil,
  Plus, X, Check, User, ChevronDown, Upload, Search, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import {
  getProfile, updateProfile, uploadAvatar,
  getProfileSkills, listSkills, addProfileSkill, removeProfileSkill,
  listPortfolio, createPortfolioItem, updatePortfolioItem, deletePortfolioItem,
  listUserReviews,
} from '@/lib/api/bl';
import type { Profile, ProfileSkill, Skill, Review, PortfolioItem } from '@/lib/types';

const GRADE_LABEL: Record<string, string> = {
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
};

const PROFICIENCY_COLOR: Record<string, string> = {
  JUNIOR: 'bg-blue-500/10 text-blue-400',
  MIDDLE: 'bg-yellow-500/10 text-yellow-400',
  SENIOR: 'bg-green-500/10 text-green-400',
};

// ─── Calendar helpers ──────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function generateCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDay = firstDay.getDay() - 1;
  if (startDay === -1) startDay = 6;
  const days = [];
  const prevLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevLastDay - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({ date: d, dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`, isCurrentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    days.push({ date: i, dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`, isCurrentMonth: false });
  }
  return days;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);

  // Real data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<ProfileSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Header editing
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerFirstName, setHeaderFirstName] = useState('');
  const [headerLastName, setHeaderLastName] = useState('');
  const [headerPosition, setHeaderPosition] = useState('');
  const [headerLocation, setHeaderLocation] = useState('');
  const [headerHourlyRate, setHeaderHourlyRate] = useState(0);
  const [headerSaving, setHeaderSaving] = useState(false);

  // Bio editing
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [aboutSaving, setAboutSaving] = useState(false);

  // Skills editing
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillQuery, setSkillQuery] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<Skill[]>([]);
  const [skillAdding, setSkillAdding] = useState(false);

  // Portfolio
  const [editingItem, setEditingItem] = useState<Partial<PortfolioItem> | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editProjectUrl, setEditProjectUrl] = useState('');
  const [itemSaving, setItemSaving] = useState(false);
  const [isViewingItem, setIsViewingItem] = useState<PortfolioItem | null>(null);

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Availability calendar (local state)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [availability, setAvailability] = useState<{ free: string[]; busy: string[] }>({
    free: [],
    busy: [],
  });

  // Load everything on mount
  useEffect(() => {
    const uid = localStorage.getItem('user_id');
    if (!uid) { setLoading(false); return; }
    setUserId(uid);

    Promise.all([
      getProfile(uid),
      getProfileSkills(uid).catch(() => [] as ProfileSkill[]),
      listUserReviews(uid).catch(() => [] as Review[]),
      listPortfolio(uid).catch(() => [] as PortfolioItem[]),
    ]).then(([prof, sk, rev, port]) => {
      setProfile(prof);
      setSkills(sk);
      setReviews(rev);
      setPortfolio(port);
      // Seed edit fields
      setHeaderFirstName(prof.first_name);
      setHeaderLastName(prof.last_name);
      setHeaderPosition(prof.position ?? '');
      setHeaderLocation(prof.location ?? '');
      setHeaderHourlyRate(prof.hourly_rate ?? 0);
      setAboutText(prof.bio ?? '');
    }).catch(() => {}).finally(() => setLoading(false));

    // Seed availability mock for current month
    const fmt = (d: number) =>
      `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setAvailability({ free: [fmt(1), fmt(2), fmt(5), fmt(6), fmt(9)], busy: [fmt(7), fmt(8)] });
  }, [currentYear, currentMonth]);

  // Skill autocomplete
  useEffect(() => {
    if (!skillQuery.trim()) { setSkillSuggestions([]); return; }
    const t = setTimeout(() => {
      listSkills(skillQuery).then(setSkillSuggestions).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [skillQuery]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSaveHeader = async () => {
    if (!userId || !profile) return;
    setHeaderSaving(true);
    try {
      const updated = await updateProfile(userId, userId, {
        first_name: headerFirstName,
        last_name: headerLastName,
        position: headerPosition || undefined,
        location: headerLocation || undefined,
        hourly_rate: headerHourlyRate || undefined,
      });
      setProfile(updated);
      setIsEditingHeader(false);
    } catch (e) {
      console.error(e);
    } finally {
      setHeaderSaving(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!userId) return;
    setAboutSaving(true);
    try {
      const updated = await updateProfile(userId, userId, { bio: aboutText });
      setProfile(updated);
      setIsEditingAbout(false);
    } catch (e) {
      console.error(e);
    } finally {
      setAboutSaving(false);
    }
  };

  const handleAddSkill = async (skill: Skill) => {
    if (!userId || skillAdding) return;
    if (skills.some((s) => s.skill_id === skill.id)) {
      setSkillQuery('');
      setSkillSuggestions([]);
      return;
    }
    setSkillAdding(true);
    try {
      const added = await addProfileSkill(userId, skill.id);
      setSkills((prev) => [...prev, { ...added, skill_name: skill.name }]);
      setSkillQuery('');
      setSkillSuggestions([]);
    } catch (e) {
      console.error(e);
    } finally {
      setSkillAdding(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!userId) return;
    try {
      await removeProfileSkill(userId, skillId);
      setSkills((prev) => prev.filter((s) => s.skill_id !== skillId));
    } catch (e) {
      console.error(e);
    }
  };

  const openNewItem = () => {
    setEditingItem({});
    setEditTitle('');
    setEditDescription('');
    setEditProjectUrl('');
  };

  const openEditItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description ?? '');
    setEditProjectUrl(item.project_url ?? '');
  };

  const handleSavePortfolioItem = async () => {
    if (!userId || !editTitle.trim()) return;
    setItemSaving(true);
    try {
      if (editingItem?.id) {
        // Update
        const updated = await updatePortfolioItem(editingItem.id, userId, {
          title: editTitle,
          description: editDescription || undefined,
          project_url: editProjectUrl || undefined,
        });
        setPortfolio((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        // Create
        const created = await createPortfolioItem({
          user_id: userId,
          title: editTitle,
          description: editDescription || undefined,
          project_url: editProjectUrl || undefined,
        });
        setPortfolio((prev) => [...prev, created]);
      }
      setEditingItem(null);
    } catch (e) {
      console.error(e);
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeletePortfolioItem = async (itemId: string) => {
    if (!userId) return;
    try {
      await deletePortfolioItem(itemId, userId);
      setPortfolio((prev) => prev.filter((p) => p.id !== itemId));
      setEditingItem(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    try {
      const updated = await uploadAvatar(userId, userId, file);
      setProfile(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAvailability = (dateStr: string) => {
    if (!isEditingAvailability) return;
    setAvailability((prev) => {
      const isFree = prev.free.includes(dateStr);
      const isBusy = prev.busy.includes(dateStr);
      if (isFree) return { free: prev.free.filter((d) => d !== dateStr), busy: [...prev.busy, dateStr] };
      if (isBusy) return { free: prev.free, busy: prev.busy.filter((d) => d !== dateStr) };
      return { free: [...prev.free, dateStr], busy: prev.busy };
    });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-2">Профиль не найден</p>
          <Link href="/freelancers" className="text-primary hover:underline">← К фрилансерам</Link>
        </div>
      </div>
    );
  }

  const avatarUrl = profile.avatar_url ?? null;

  const currentMonthDays = generateCalendar(currentYear, currentMonth);
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonthDays = generateCalendar(nextYear, nextMonth);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/freelancers" className="hover:text-white transition-colors">Фрилансеры</Link>
        <span>›</span>
        <span className="text-white font-medium">{profile.first_name} {profile.last_name}</span>
      </div>

      {/* Header */}
      <div className="bg-slate-card border border-slate-border rounded-2xl p-6 lg:p-8 mb-6 relative group flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
        <button
          onClick={() => setIsEditingHeader(!isEditingHeader)}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
        >
          {isEditingHeader ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
        </button>

        <div className="flex flex-col sm:flex-row gap-6 items-start w-full lg:w-auto">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar
              src={avatarUrl}
              name={`${profile.first_name} ${profile.last_name}`}
              size={120}
              className="border-4 border-slate-800"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-slate-card rounded-full" />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Изменить фото"
            >
              <Upload className="w-5 h-5 text-white" />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 w-full">
            {isEditingHeader ? (
              <div className="space-y-3 max-w-md">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={headerFirstName}
                    onChange={(e) => setHeaderFirstName(e.target.value)}
                    placeholder="Имя"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                  <input
                    type="text"
                    value={headerLastName}
                    onChange={(e) => setHeaderLastName(e.target.value)}
                    placeholder="Фамилия"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
                <div className="relative">
                  <select
                    value={headerPosition}
                    onChange={(e) => setHeaderPosition(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="">— Специализация —</option>
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
                  value={headerLocation}
                  onChange={(e) => setHeaderLocation(e.target.value)}
                  placeholder="Местоположение"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300"
                />
                <button
                  onClick={handleSaveHeader}
                  disabled={headerSaving}
                  className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 w-fit disabled:opacity-60"
                >
                  <Check className="w-4 h-4" /> {headerSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile.first_name} {profile.last_name}</h1>
                  {profile.is_verified && <CheckCircle2 className="w-6 h-6 text-primary" />}
                  {profile.grade && (
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-sm font-bold rounded-lg border border-primary/20">
                      {GRADE_LABEL[profile.grade]}
                    </span>
                  )}
                </div>
                {profile.position && <p className="text-slate-300 text-lg mb-4">{profile.position}</p>}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-4">
                  {profile.review_count > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-white">{profile.rating.toFixed(1)}</span>
                      <span>({profile.review_count} отзывов)</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Отвечает быстро</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Доступен сейчас
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rates & Stats */}
        <div className="w-full lg:w-auto lg:min-w-[280px] border-t lg:border-t-0 lg:border-l border-slate-border pt-6 lg:pt-0 lg:pl-8">
          {isEditingHeader ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Почасовая ставка ($)</label>
                <input
                  type="number"
                  value={headerHourlyRate}
                  onChange={(e) => setHeaderHourlyRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          ) : (
            <>
              {profile.hourly_rate != null && (
                <div className="mb-8">
                  <p className="text-xs text-slate-400 mb-1">Почасовая</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${profile.hourly_rate}</span>
                    <span className="text-sm text-slate-500">/час</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {profile.success_rate > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{profile.success_rate.toFixed(0)}%</p>
                      <p className="text-xs text-slate-400">Вовремя</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{profile.completed_count}</p>
                    <p className="text-xs text-slate-400">Работ</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* About */}
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
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 min-h-[150px] resize-y"
                  placeholder="Расскажите о себе, своём опыте и навыках..."
                />
                <button
                  onClick={handleSaveAbout}
                  disabled={aboutSaving}
                  className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" /> {aboutSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {profile.bio || <span className="text-slate-500 italic">Расскажите о себе...</span>}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 relative group">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">Навыки и инструменты</h2>
            </div>
            <button
              onClick={() => { setIsEditingSkills(!isEditingSkills); setSkillQuery(''); setSkillSuggestions([]); }}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              {isEditingSkills ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>

            {/* Skills list */}
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((ps) => (
                <div key={ps.skill_id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm">
                  <span className="text-slate-300">{ps.skill_name ?? ps.skill_id}</span>
                  {ps.proficiency && (
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PROFICIENCY_COLOR[ps.proficiency] ?? 'bg-slate-700 text-slate-400'}`}>
                      {ps.proficiency}
                    </span>
                  )}
                  {isEditingSkills && (
                    <button onClick={() => handleRemoveSkill(ps.skill_id)} className="text-slate-500 hover:text-red-400 transition-colors ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {skills.length === 0 && !isEditingSkills && (
                <p className="text-slate-500 text-sm italic">Навыки не добавлены</p>
              )}
            </div>

            {/* Add skill autocomplete */}
            {isEditingSkills && (
              <div className="relative">
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={skillQuery}
                    onChange={(e) => setSkillQuery(e.target.value)}
                    placeholder="Найти навык..."
                    className="bg-transparent text-white text-sm focus:outline-none flex-1"
                  />
                  {skillAdding && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />}
                </div>
                {skillSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                    {skillSuggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleAddSkill(s)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between"
                      >
                        {s.name}
                        {skills.some((ps) => ps.skill_id === s.id) && (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
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
              <button
                onClick={openNewItem}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Добавить работу"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {portfolio.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Портфолио пусто</p>
                <button onClick={openNewItem} className="mt-3 text-primary text-sm hover:underline">+ Добавить первую работу</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="group/item border border-slate-700 rounded-xl p-4 bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer relative"
                    onClick={() => setIsViewingItem(item)}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditItem(item); }}
                      className="absolute top-3 right-3 p-1.5 bg-slate-700 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                    <h3 className="text-base font-bold text-white mb-1 pr-8">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                    )}
                    {item.project_url && (
                      <span className="text-xs text-primary mt-2 block">Ссылка →</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">Отзывы клиентов ({reviews.length})</h2>
            </div>

            {reviews.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Отзывов пока нет</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <div key={review.id} className={idx !== 0 ? 'pt-6 border-t border-slate-border' : ''}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                          {review.author_id.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{review.author_id.slice(0, 8)}...</h4>
                          <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= review.score ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`} />
                        ))}
                      </div>
                    </div>
                    {review.text && (
                      <p className="text-sm text-slate-300 leading-relaxed">{review.text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Availability Calendar */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 relative group">
            <button
              onClick={() => setIsEditingAvailability(!isEditingAvailability)}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-all z-10 ${
                isEditingAvailability
                  ? 'bg-primary text-background-dark font-bold px-3 py-1.5 flex items-center gap-1.5 text-sm opacity-100'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 opacity-0 group-hover:opacity-100'
              }`}
            >
              {isEditingAvailability ? <><Check className="w-4 h-4" /> Готово</> : <Pencil className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-bold text-white">Доступность</h2>
            </div>

            <div className="space-y-6">
              {[
                { label: `${MONTH_NAMES[currentMonth]} ${currentYear}`, days: currentMonthDays },
                { label: `${MONTH_NAMES[nextMonth]} ${nextYear}`, days: nextMonthDays },
              ].map(({ label, days }) => (
                <div key={label}>
                  <h3 className="text-sm font-medium text-slate-300 mb-3 text-center">{label}</h3>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                      <div key={d} className="text-xs font-medium text-slate-500 mb-1">{d}</div>
                    ))}
                    {days.map((dayObj, idx) => {
                      const isFree = availability.free.includes(dayObj.dateStr);
                      const isBusy = availability.busy.includes(dayObj.dateStr);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleAvailability(dayObj.dateStr)}
                          disabled={!isEditingAvailability}
                          className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium transition-colors
                            ${isEditingAvailability ? 'cursor-pointer' : 'cursor-default'}
                            ${!dayObj.isCurrentMonth ? 'opacity-30' : ''}
                            ${isFree ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
                            ${isBusy ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                            ${!isFree && !isBusy ? 'text-slate-400' : ''}
                          `}
                        >
                          {dayObj.date}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 text-xs mt-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Свободен
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Занят
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Статистика</h3>
            <div className="space-y-3 text-sm">
              {profile.review_count > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Рейтинг</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {profile.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Проектов завершено</span>
                <span className="text-white font-bold">{profile.completed_count}</span>
              </div>
              {profile.total_earned > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Заработано</span>
                  <span className="text-white font-bold">${profile.total_earned.toLocaleString('en-US')}</span>
                </div>
              )}
              {profile.is_verified && (
                <div className="flex items-center gap-2 text-emerald-400 pt-2 border-t border-slate-border/50">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Верифицирован</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ─── Portfolio item view modal ─────────────────────────────────────────── */}
      {isViewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
          <div className="bg-slate-card border border-slate-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-white">{isViewingItem.title}</h3>
              <button onClick={() => setIsViewingItem(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {isViewingItem.description && (
                <p className="text-slate-300 text-sm leading-relaxed">{isViewingItem.description}</p>
              )}
              {isViewingItem.project_url && (
                <a
                  href={isViewingItem.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Посмотреть проект →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Portfolio add/edit modal ──────────────────────────────────────────── */}
      {editingItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
          <div className="bg-slate-card border border-slate-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-white">{editingItem.id ? 'Редактировать работу' : 'Добавить работу'}</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Название проекта *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="Например: FinTech Dashboard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Описание</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-y"
                  placeholder="Опишите задачу и результат..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Ссылка на проект</label>
                <input
                  type="url"
                  value={editProjectUrl}
                  onChange={(e) => setEditProjectUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
              {editingItem.id ? (
                <button
                  onClick={() => handleDeletePortfolioItem(editingItem.id!)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Удалить
                </button>
              ) : <span />}
              <button
                onClick={handleSavePortfolioItem}
                disabled={!editTitle.trim() || itemSaving}
                className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg disabled:opacity-50 transition-opacity flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> {itemSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
