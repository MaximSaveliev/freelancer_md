'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Calendar, ImageOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getPortfolioItem, listPortfolioImages, getProfile } from '@/lib/api/bl';
import type { PortfolioItem, PortfolioImage, Profile } from '@/lib/types';
import { Avatar } from '@/components/avatar';

export default function PortfolioItemPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPortfolioItem(id)
      .then(async (portfolioItem) => {
        setItem(portfolioItem);
        const [imgs, profile] = await Promise.all([
          listPortfolioImages(portfolioItem.id).catch(() => [] as PortfolioImage[]),
          getProfile(portfolioItem.user_id).catch(() => null),
        ]);
        setImages(imgs);
        setAuthor(profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Проект не найден</p>
          <Link href="/freelancers" className="text-primary hover:underline">← Назад к фрилансерам</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        <Link
          href={author ? `/freelancers/${item.user_id}` : '/freelancers'}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {author ? `Профиль ${author.first_name} ${author.last_name}` : 'Назад'}
        </Link>

        <div className="space-y-6">

          {/* Image gallery */}
          {images.filter(img => img.url).length > 0 ? (
            <div className="bg-slate-card border border-slate-border rounded-2xl overflow-hidden">
              <div className="relative aspect-video bg-slate-900">
                {images[activeImage]?.url ? (
                  <Image
                    src={images[activeImage].url}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <ImageOff className="w-12 h-12" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, i) => img.url ? (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === activeImage ? 'border-primary' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.url} alt="" width={64} height={64} className="w-full h-full object-cover" />
                    </button>
                  ) : null)}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-card border border-slate-border rounded-2xl aspect-video flex flex-col items-center justify-center gap-3 text-slate-500">
              <ImageOff className="w-10 h-10" />
              <p className="text-sm">Изображения отсутствуют</p>
            </div>
          )}

          {/* Main content */}
          <div className="grid lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-card border border-slate-border rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-white mb-4">{item.title}</h1>
                {item.description && (
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">

              {/* Author */}
              {author && (
                <div className="bg-slate-card border border-slate-border rounded-2xl p-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Автор</p>
                  <Link href={`/freelancers/${item.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Avatar
                      src={author.avatar_url ?? null}
                      name={`${author.first_name} ${author.last_name}`}
                      size={44}
                    />
                    <div>
                      <p className="text-sm font-bold text-white">{author.first_name} {author.last_name}</p>
                      {author.position && <p className="text-xs text-slate-400">{author.position}</p>}
                    </div>
                  </Link>
                </div>
              )}

              {/* Meta */}
              <div className="bg-slate-card border border-slate-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                {item.project_url && (
                  <a
                    href={item.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    Открыть проект
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
