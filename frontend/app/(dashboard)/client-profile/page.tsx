'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle2, 
  Briefcase, 
  Pencil, 
  Plus,
  X,
  Check,
  Building2,
  Globe,
  Users,
  Calendar
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ClientProfilePage() {
  // Mock state for editable fields
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const [profileData, setProfileData] = useState({
    companyName: 'AgroTech Solutions',
    contactPerson: 'Александр Ионеску',
    contactTitle: 'Head of Marketing',
    location: 'Кишинёв, Молдова 🇲🇩',
    about: 'AgroTech Solutions — инновационная компания, разрабатывающая программное обеспечение для автоматизации сельскохозяйственных процессов. Мы помогаем фермерам увеличивать урожайность и снижать издержки с помощью технологий IoT и машинного обучения.\n\nМы постоянно ищем талантливых фрилансеров для участия в наших проектах: от веб-разработки до дизайна интерфейсов и маркетинговых исследований.',
    website: 'agrotech.md',
    employees: '50-100',
    founded: '2018',
    activeTasks: [
      { id: 1, title: 'Разработка лендинга для нового продукта', budget: '$500 - $800', type: 'Проект', status: 'Открыт', applicants: 12, posted: '2 дня назад' },
      { id: 2, title: 'UX/UI Аудит мобильного приложения', budget: '$300', type: 'Проект', status: 'Открыт', applicants: 5, posted: '5 дней назад' },
      { id: 3, title: 'Написание SEO-статей для блога', budget: '$15/час', type: 'Почасовая', status: 'В процессе', applicants: 3, posted: '1 неделю назад' },
    ]
  });

  const [editingTask, setEditingTask] = useState<any>(null);

  const handleSaveHeader = () => setIsEditingHeader(false);
  const handleSaveAbout = () => setIsEditingAbout(false);
  const handleSaveDetails = () => setIsEditingDetails(false);

  const handleSaveTask = () => {
    if (editingTask.id) {
      setProfileData({
        ...profileData,
        activeTasks: profileData.activeTasks.map(t => t.id === editingTask.id ? editingTask : t)
      });
    } else {
      setProfileData({
        ...profileData,
        activeTasks: [{ ...editingTask, id: Date.now(), applicants: 0, posted: 'Только что' }, ...profileData.activeTasks]
      });
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: number) => {
    setProfileData({
      ...profileData,
      activeTasks: profileData.activeTasks.filter(t => t.id !== id)
    });
    setEditingTask(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/clients" className="hover:text-white transition-colors">Заказчики</Link>
        <span>›</span>
        <Link href="/clients/it" className="hover:text-white transition-colors">IT Компании</Link>
        <span>›</span>
        <span className="text-white font-medium">{profileData.companyName}</span>
      </div>

      {/* Top Header Block (Identity Card) */}
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
            <div className="w-[120px] h-[120px] rounded-2xl bg-slate-800 border-4 border-slate-700 flex items-center justify-center overflow-hidden">
              <Image 
                src="https://picsum.photos/seed/company/150/150" 
                alt="Company Logo" 
                width={120} 
                height={120} 
                className="object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-background-dark rounded-full p-1">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="flex-1 w-full">
            {isEditingHeader ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Название компании</label>
                  <input 
                    type="text" 
                    value={profileData.companyName}
                    onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Контактное лицо</label>
                    <input 
                      type="text" 
                      value={profileData.contactPerson}
                      onChange={(e) => setProfileData({...profileData, contactPerson: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Должность</label>
                    <input 
                      type="text" 
                      value={profileData.contactTitle}
                      onChange={(e) => setProfileData({...profileData, contactTitle: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Локация</label>
                  <input 
                    type="text" 
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm"
                  />
                </div>
                <button onClick={handleSaveHeader} className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 w-fit text-sm">
                  <Check className="w-4 h-4" /> Сохранить
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{profileData.companyName}</h1>
                  <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Проверенный бизнес
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-slate-300 text-lg mb-4">
                  <span className="font-medium">{profileData.contactPerson}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{profileData.contactTitle}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  {profileData.location}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Trust Metrics (Non-editable) */}
        <div className="w-full lg:w-auto lg:min-w-[300px] border-t lg:border-t-0 lg:border-l border-slate-border pt-6 lg:pt-0 lg:pl-8">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Показатели доверия</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>Рейтинг</span>
              </div>
              <div className="font-bold text-white">4.9 <span className="text-slate-500 text-xs font-normal">(42 отзыва)</span></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>Успешных проектов</span>
              </div>
              <div className="font-bold text-white">86</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Время ответа</span>
              </div>
              <div className="font-bold text-white">~ 2 часа</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Company */}
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
                  onChange={(e) => setProfileData({...profileData, about: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 min-h-[150px]"
                />
                <button onClick={handleSaveAbout} className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" /> Сохранить
                </button>
              </div>
            ) : (
              <div className="text-slate-300 text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
                {profileData.about}
              </div>
            )}
          </div>

          {/* Active Tasks */}
          <div className="bg-slate-card border border-slate-border rounded-2xl p-6 relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-white">Активные задачи</h2>
                <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-1 rounded-md">
                  {profileData.activeTasks.length}
                </span>
              </div>
              <button 
                onClick={() => setEditingTask({ title: '', budget: '', type: 'Проект', status: 'Открыт' })}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Добавить задачу"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {profileData.activeTasks.map((task) => (
                <div key={task.id} className="group/task relative p-5 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800/80 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <Link href={`/projects/${task.id}`} className="text-lg font-bold text-white hover:text-primary transition-colors">
                      {task.title}
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-green-400">{task.budget}</span>
                      <span className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-md">
                        {task.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {task.posted}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> {task.applicants} откликов
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      task.status === 'Открыт' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  {/* Edit Button for Task */}
                  <button 
                    onClick={(e) => { e.preventDefault(); setEditingTask(task); }}
                    className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg opacity-0 group-hover/task:opacity-100 transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {profileData.activeTasks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  У вас пока нет активных задач.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar) */}
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
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Сотрудники</label>
                  <select 
                    value={profileData.employees}
                    onChange={(e) => setProfileData({...profileData, employees: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
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
                    onChange={(e) => setProfileData({...profileData, founded: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <button onClick={handleSaveDetails} className="bg-primary text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-sm w-full justify-center">
                  <Check className="w-4 h-4" /> Сохранить
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <a href={`https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {profileData.website}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300">{profileData.employees} сотрудников</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300">Основана в {profileData.founded}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit/Add Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-card border border-slate-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-white">{editingTask.id ? 'Редактировать задачу' : 'Создать задачу'}</h3>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Название задачи</label>
                <input 
                  type="text" 
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="Например: Разработка лендинга"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Бюджет</label>
                  <input 
                    type="text" 
                    value={editingTask.budget}
                    onChange={(e) => setEditingTask({...editingTask, budget: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="$500 или $15/час"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Тип оплаты</label>
                  <select 
                    value={editingTask.type}
                    onChange={(e) => setEditingTask({...editingTask, type: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="Проект">За проект (Фикс)</option>
                    <option value="Почасовая">Почасовая</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Статус</label>
                <select 
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="Открыт">Открыт (Поиск исполнителя)</option>
                  <option value="В процессе">В процессе (Исполнитель найден)</option>
                  <option value="Завершен">Завершен</option>
                  <option value="Отменен">Отменен</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
              {editingTask.id ? (
                <button onClick={() => handleDeleteTask(editingTask.id)} className="text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 transition-colors">
                  Удалить задачу
                </button>
              ) : (
                <div></div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setEditingTask(null)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium">
                  Отмена
                </button>
                <button 
                  onClick={handleSaveTask} 
                  disabled={!editingTask.title.trim()}
                  className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
