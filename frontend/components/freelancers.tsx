'use client';

import { motion } from 'motion/react';
import { Star, BadgeCheck } from 'lucide-react';
import Image from 'next/image';

export function Freelancers() {
  const freelancers = [
    {
      name: 'Михай Б.',
      role: 'Senior Python Dev',
      rating: '5.0',
      reviews: '42',
      tags: ['Django', 'Flask'],
      image: 'https://api.dicebear.com/9.x/micah/svg?seed=Mihai&backgroundColor=b6e3f4',
      verified: true,
      borderColor: 'border-primary',
    },
    {
      name: 'Искандер Э.',
      role: 'Brand Designer',
      rating: '4.9',
      reviews: '28',
      tags: ['Figma', 'Logo'],
      image: 'https://api.dicebear.com/9.x/micah/svg?seed=Iskander&backgroundColor=ffd5dc',
      verified: true,
      borderColor: 'border-primary',
    },
    {
      name: 'Максим С.',
      role: 'Mobile Dev (iOS)',
      rating: '4.8',
      reviews: '15',
      tags: ['Swift', 'SwiftUI'],
      image: 'https://api.dicebear.com/9.x/micah/svg?seed=Jack&backgroundColor=ffdfbf',
      verified: false,
      borderColor: 'border-slate-600',
    },
    {
      name: 'Мария П.',
      role: 'Copywriter',
      rating: '5.0',
      reviews: '64',
      tags: ['SEO', 'Blog'],
      image: 'https://api.dicebear.com/9.x/micah/svg?seed=Sophia&backgroundColor=c0aede',
      verified: true,
      borderColor: 'border-primary',
    },
  ];

  return (
    <section className="py-24 bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8">Топовые исполнители</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {freelancers.map((freelancer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-slate-card border border-slate-border rounded-2xl p-6 flex flex-col items-center text-center"
            >
              <div className="relative mb-4">
                <Image 
                  src={freelancer.image} 
                  alt={freelancer.name} 
                  width={80} 
                  height={80} 
                  className={`rounded-full object-cover border-2 ${freelancer.borderColor}`}
                  referrerPolicy="no-referrer"
                />
                {freelancer.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-background-dark rounded-full p-1">
                    <BadgeCheck className="w-4 h-4 font-bold" />
                  </div>
                )}
              </div>
              
              <h4 className="text-white font-bold text-lg">{freelancer.name}</h4>
              <p className="text-primary text-sm font-medium mb-3">{freelancer.role}</p>
              
              <div className="flex items-center gap-1 text-yellow-400 text-sm mb-4">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{freelancer.rating}</span>
                <span className="text-slate-500">({freelancer.reviews} отзывов)</span>
              </div>
              
              <div className="flex gap-2 flex-wrap justify-center mb-4">
                {freelancer.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
              
              <button className="w-full py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer mt-auto">
                Профиль
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
