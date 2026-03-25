import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionBootstrap } from '@/components/session-bootstrap';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'freelancer.md - Премиум биржа фриланса',
  description: 'Безопасные сделки через эскроу и проверенные профессионалы. Найдите идеального исполнителя или проект за считанные минуты.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased selection:bg-primary/30 selection:text-primary overflow-x-hidden`} suppressHydrationWarning>
        <SessionBootstrap>
          {children}
        </SessionBootstrap>
      </body>
    </html>
  );
}
