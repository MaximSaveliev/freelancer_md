'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, Phone, Video, Info, Paperclip, Smile, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar } from '@/components/avatar';

const MOCK_CHATS = [
  {
    id: '1',
    user: { name: 'Александр И.', role: 'Заказчик', isOnline: true },
    lastMessage: 'Здравствуйте! Готов обсудить детали проекта.',
    time: '10:42',
    unreadCount: 2,
    messages: [
      { id: 1, sender: 'them', text: 'Привет! Я посмотрел твое портфолио.', time: '10:30' },
      { id: 2, sender: 'me', text: 'Здравствуйте! Спасибо.', time: '10:35' },
      { id: 3, sender: 'them', text: 'У меня есть проект по разработке интернет-магазина.', time: '10:40' },
      { id: 4, sender: 'them', text: 'Здравствуйте! Готов обсудить детали проекта.', time: '10:42' },
    ],
  },
  {
    id: '2',
    user: { name: 'Елена П.', role: 'Заказчик', isOnline: false },
    lastMessage: 'Да, я могу сделать это до пятницы.',
    time: 'Вчера',
    unreadCount: 1,
    messages: [
      { id: 1, sender: 'me', text: 'Елена, успеем ли закончить дизайн к пятнице?', time: 'Вчера 15:00' },
      { id: 2, sender: 'them', text: 'Да, я могу сделать это до пятницы.', time: 'Вчера 15:30' },
    ],
  },
  {
    id: '3',
    user: { name: 'Дмитрий С.', role: 'Заказчик', isOnline: true },
    lastMessage: 'Спасибо за работу!',
    time: 'Пн',
    unreadCount: 0,
    messages: [
      { id: 1, sender: 'me', text: 'Отправил исходники на почту.', time: 'Пн 10:00' },
      { id: 2, sender: 'them', text: 'Получил, всё отлично.', time: 'Пн 10:15' },
      { id: 3, sender: 'them', text: 'Спасибо за работу!', time: 'Пн 10:16' },
    ],
  },
];

export default function MessagesPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState(MOCK_CHATS);
  const [myName, setMyName] = useState('Вы');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      import('@/lib/api/bl').then(({ getProfile }) => {
        getProfile(userId).then(p => setMyName(`${p.first_name} ${p.last_name}`.trim())).catch(() => {});
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const filteredChats = chats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChats(prev => prev.map(chat =>
      chat.id === activeChatId
        ? { ...chat, lastMessage: newMessage, time: newMsg.time, messages: [...chat.messages, newMsg] }
        : chat
    ));
    setNewMessage('');
  };

  useEffect(() => {
    if (activeChatId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChats(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, unreadCount: 0 } : chat));
    }
  }, [activeChatId]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background-dark flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-border flex flex-col bg-slate-card/30 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-border">
          <h1 className="text-xl font-bold text-white mb-4">Сообщения</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Поиск сообщений..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background-dark border border-slate-border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Ничего не найдено</div>
          ) : (
            filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left p-4 border-b border-slate-border/50 hover:bg-slate-800/50 transition-colors flex items-start gap-3 relative ${activeChatId === chat.id ? 'bg-slate-800/80' : ''}`}
              >
                <div className="relative shrink-0">
                  <Avatar name={chat.user.name} size={48} className="border border-slate-border" />
                  {chat.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-card rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-bold text-white truncate pr-2">{chat.user.name}</h3>
                    <span className={`text-xs whitespace-nowrap ${chat.unreadCount > 0 ? 'text-primary font-medium' : 'text-slate-500'}`}>
                      {chat.time}
                    </span>
                  </div>
                  <p className={`text-sm line-clamp-1 ${chat.unreadCount > 0 ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {chat.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className={`flex-1 flex flex-col bg-background-dark ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            <div className="h-16 border-b border-slate-border flex items-center justify-between px-4 sm:px-6 bg-slate-card/30 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="relative">
                  <Avatar name={activeChat.user.name} size={40} className="border border-slate-border" />
                  {activeChat.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-card rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{activeChat.user.name}</h2>
                  <p className="text-xs text-slate-400">{activeChat.user.isOnline ? 'В сети' : 'Был(а) недавно'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button className="p-2 text-slate-400 hover:text-white transition-colors hidden sm:block"><Phone className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors hidden sm:block"><Video className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors"><Info className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeChat.messages.map((msg, index) => {
                const isMe = msg.sender === 'me';
                const showAvatar = index === activeChat.messages.length - 1 || activeChat.messages[index + 1].sender !== msg.sender;
                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-8 shrink-0 flex items-end">
                        {showAvatar && <Avatar name={activeChat.user.name} size={32} />}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[60%]`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                    {isMe && (
                      <div className="w-8 shrink-0 flex items-end justify-end">
                        {showAvatar && <Avatar name={myName} size={32} />}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-border bg-slate-card/30 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <button type="button" className="p-3 text-slate-400 hover:text-white transition-colors shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                    placeholder="Напишите сообщение..."
                    className="w-full bg-slate-800/50 border border-slate-border rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none max-h-32 min-h-[46px]"
                    rows={1}
                  />
                  <button type="button" className="absolute right-3 bottom-3 text-slate-400 hover:text-white transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Ваши сообщения</h2>
            <p className="text-sm max-w-md">Выберите чат из списка слева, чтобы начать общение.</p>
          </div>
        )}
      </div>
    </div>
  );
}
