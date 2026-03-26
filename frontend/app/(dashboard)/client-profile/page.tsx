'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  Briefcase,
  Pencil,
  X,
  Check,
  Building2,
  Globe,
  Users,
  Calendar
} from 'lucide-react';
import { Avatar } from '@/components/avatar';
import Link from 'next/link';
import { getProfile, updateProfile, listProjects } from '@/lib/api/bl';
import type { Profile, Project, ProjectBudget } from '@/lib/types';

function formatBudget(budget: ProjectBudget | null): string {
  if (!budget) return 'Договорная';
  if (budget.amount != null) return `$${budget.amount.toLocaleString('en-US')}`;
  if (budget.min != null && budget.max != null) return `$${budget.min} – $${budget.max}`;
  return 'Договорная';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (hours < 1) return 'Только что';
  if (hours < 24) return `${hours} ч. назад`;
  if (days === 1) return 'Вчера';
  return `${days} дн. назад`;
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Открыт',
  IN_PROGRESS: 'В процессе',
  COMPLETED: 'Завершен',
  CANCELLED: 'Отменен',
};

export default function ClientProfilePage() {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [userId] = useState<string | null>(() => (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null));
  const [loading, setLoading] = useState(() => !!(typeof window !== 'undefined' && localStorage.getItem('user_id')));
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const [profileData, setProfileData] = useState({
    companyName: '',
    contactPerson: '',
    contactTitle: '',
    location: '',
    about: '',
    website: '',
    employees: '',
    founded: '',
  });

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      getProfile(userId),
      listProjects({ user_id: userId }),
    ])
      .then(([prof, projs]) => {
        setProfile(prof);
        setProfileData({
          companyName: prof.company_name || '',
          contactPerson: `${prof.first_name} ${prof.last_name}`.trim(),
          contactTitle: prof.position || '',
          location: prof.location || '',
          about: prof.bio || '',
          website: prof.website_url || '',
          employees: prof.company_size || '',
          founded: prof.founded_year ? String(prof.founded_year) : '',
        });
        setProjects(projs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const saveHeader = async () => {
    if (!userId) return;
    setSaving(true);
    const [firstName, ...lastParts] = profileData.contactPerson.split(' ');
    try {
      await updateProfile(userId, userId, {
        first_name: firstName || '',
        last_name: lastParts.join(' '),
        company_name: profileData.companyName || undefined,
        position: profileData.contactTitle || undefined,
        location: profileData.location || undefined,
      });
    } catch { /* ignore */ }
    setSaving(false);
    setIsEditingHeader(false);
  };

  const saveAbout = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateProfile(userId, userId, { bio: profileData.about || undefined });
    } catch { /* ignore */ }
    setSaving(false);
    setIsEditingAbout(false);
  };

  const saveDetails = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateProfile(userId, userId, {
        website_url: profileData.website || undefined,
        company_size: profileData.employees || undefined,
        founded_year: profileData.founded ? parseInt(profileData.founded) : undefined,
      });
    } catch { /* ignore */ }
    setSaving(false);
    setIsEditingDetails(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Top Header Block */}
      <div className="bg-slate-card border border-slate-border rounded-2xl p-6 lg:p-8 mb-6 relative group flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
        <button
          onClick={() => setIsEditingHeader(!isEditingHeader)}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
        >
          {isEditingHeader ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
        </button>

        <div className="flex flex-col sm:flex-row gap-6 items-start w-full lg:w-auto">
          <div className="relative shrink-0">
            <div className="rounded-2xl overflow-hidden border-4 border-slate-700">
              <Avatar
                src={profile?.avatar_url ?? null}
                name={profileData.companyName || profileData.contactPerson || 'Клиент'}
                size={120}
                rounded="2xl"
              />
            </div>
            {profile?.is_verified && (
              <div className="absolute -bottom-2 -right-2 bg-background-dark rounded-full p-1">
                <CheckCircle2 className="w-6 h-6 text-blue-500" />
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            {isEditingHeader ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Название компании</label>
                  <input
                    type="text"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xl"
                    placeholder="Название компании"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Контактное лицо</label>
                    <input
                      type="text"
                      value={profileData.contactPerson}
                      onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Должность</label>
                    <input
                      type="text"
                      value={profileData.contactTitle}
                      onChange={(e) => setProfileData({ ...profileData, contactTitle: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Локация</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm"
                    placeholder="Кишинёв, Молдова"
                  />
                </div>
                <button
                  onClick={saveHeader}
                  disabled={saving}
                  className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 w-fit text-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Сохранить
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {profileData.companyName || profileData.contactPerson || 'Заказчик'}
                  </h1>
                  {profile?.is_verified && (
                    <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Проверенный
                    </span>
                  )}
                </div>
                {profileData.contactPerson && profileData.companyName && (
                  <div className="flex items-center gap-2 text-slate-300 text-lg mb-4">
                    <span className="font-medium">{profileData.contactPerson}</span>
                    {profileData.contactTitle && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{profileData.contactTitle}</span>
                      </>
                    )}
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Trust Metrics */}
        <div className="w-full lg:w-auto lg:min-w-[300px] border-t lg:border-t-0 lg:border-l border-slate-border pt-6 lg:pt-0 lg:pl-8">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Показатели</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>Рейтинг</span>
              </div>
              <div className="font-bold text-white">
                {profile ? `${profile.rating.toFixed(1)} ` : '—'}
                {profile && profile.review_count > 0 && (
                  <span className="text-slate-500 text-xs font-normal">({profile.review_count} отзывов)</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>Проектов</span>
              </div>
              <div className="font-bold text-white">{projects.length}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4 text-green-400" />
                <span>На платформе с</span>
              </div>
              <div className="font-bold text-white text-sm">
                {profile ? new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* About */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 relative group">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">О компании</h2>
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
                  onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 min-h-[150px]"
                  placeholder="Расскажите о вашей компании..."
                />
                <button
                  onClick={saveAbout}
                  disabled={saving}
                  className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Сохранить
                </button>
              </div>
            ) : (
              <div className="text-slate-300 text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
                {profileData.about || <span className="text-slate-500">Добавьте описание компании...</span>}
              </div>
            )}
          </div>

          {/* Active Projects */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-white">Активные задачи</h2>
                <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-1 rounded-md">
                  {projects.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS').length}
                </span>
              </div>
              <Link
                href="/projects/new"
                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium rounded-lg transition-colors"
              >
                + Новый проект
              </Link>
            </div>

            <div className="space-y-4">
              {projects
                .filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS')
                .map((project) => (
                  <div key={project.id} className="relative p-5 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800/80 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <Link href={`/manage-project/${project.id}`} className="text-lg font-bold text-white hover:text-primary transition-colors">
                        {project.title}
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-green-400">{formatBudget(project.budget)}</span>
                        <span className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-md">
                          {project.payment_type === 'HOURLY' ? 'Почасовая' : 'Проект'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> {timeAgo(project.created_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> {project.bid_count} откликов
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        project.status === 'OPEN'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {STATUS_LABEL[project.status] || project.status}
                      </span>
                    </div>
                  </div>
                ))}
              {projects.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS').length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  У вас пока нет активных задач.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Company Details */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 relative group">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-bold text-white">Детали компании</h2>
            </div>
            <button
              onClick={() => setIsEditingDetails(!isEditingDetails)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              {isEditingDetails ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>

            {isEditingDetails ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Веб-сайт</label>
                  <input
                    type="text"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="company.md"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Сотрудники</label>
                  <select
                    value={profileData.employees}
                    onChange={(e) => setProfileData({ ...profileData, employees: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">Не указано</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="50-100">50-100</option>
                    <option value="100-500">100-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Год основания</label>
                  <input
                    type="text"
                    value={profileData.founded}
                    onChange={(e) => setProfileData({ ...profileData, founded: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="2020"
                  />
                </div>
                <button
                  onClick={saveDetails}
                  disabled={saving}
                  className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-sm w-full justify-center disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Сохранить
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {profileData.website ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <a href={/^https?:\/\//i.test(profileData.website) ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                      {profileData.website.replace(/^https?:\/\//i, '')}
                    </a>
                  </div>
                ) : null}
                {profileData.employees ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">{profileData.employees} сотрудников</span>
                  </div>
                ) : null}
                {profileData.founded ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">Основана в {profileData.founded}</span>
                  </div>
                ) : null}
                {!profileData.website && !profileData.employees && !profileData.founded && (
                  <p className="text-sm text-slate-500">Добавьте детали компании...</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
