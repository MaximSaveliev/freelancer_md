import Link from 'next/link';
import { Handshake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background-dark border-t border-slate-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-background-dark">
                <Handshake className="w-4 h-4 font-bold" />
              </div>
              <span className="text-lg font-bold text-white">freelancer.md</span>
            </div>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Ведущая фриланс-биржа Молдовы для поиска удаленной работы и найма специалистов.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-card flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
                <span className="text-xs font-bold">In</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-card flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
                <span className="text-xs font-bold">Fb</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-card flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
                <span className="text-xs font-bold">Tg</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Категории</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-primary transition-colors">Разработка</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Дизайн</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Маркетинг</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Тексты</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">О нас</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-primary transition-colors">Как это работает</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Цены</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Блог</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Контакты</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-primary transition-colors">Помощь</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Правила</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Безопасность</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 freelancer.md. Все права защищены.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-300 transition-colors">Политика конфиденциальности</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Условия использования</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
