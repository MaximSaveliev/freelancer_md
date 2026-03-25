'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Send } from 'lucide-react';
import Image from 'next/image';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { HubConnection } from '@microsoft/signalr';
import { createChatHubConnection } from './signalr-chat';
import {
	createOrGetConversation,
	getConversationMessages,
	listConversations,
	type ConversationDto,
	type ConversationMessageDto,
} from '@/lib/conversations';
import {
	chatHubOnMessageReceived,
	chatHubSendMessage,
	chatHubMarkLastSeenMessage,
	chatHubOnLastSeenUpdated,
	type LastSeenUpdatedPayload,
	type MessageReceivedPayload,
} from './signalr-chat';

const DEFAULT_AVATAR_URL = '/vercel.svg';

export default function MessagesPage() {
	const params = useParams<{ conversationId?: string }>();
	const routeConversationId = useMemo(() => {
		const raw = params?.conversationId;
		if (!raw) return null;
		const n = Number(raw);
		return Number.isFinite(n) ? n : null;
	}, [params]);

	const [activeConversationId, setActiveConversationId] = useState<number | null>(routeConversationId);
	const [searchQuery, setSearchQuery] = useState('');
		const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [conversations, setConversations] = useState<ConversationDto[] | null>(null);

	const activeConversation = useMemo(() => {
		if (!activeConversationId || !conversations) return null;
		return conversations.find((c) => c.id === activeConversationId) ?? null;
	}, [activeConversationId, conversations]);

	const activeConversationTitle = useMemo(() => {
		const name = `${activeConversation?.otherUser?.firstName ?? ''} ${activeConversation?.otherUser?.lastName ?? ''}`.trim();
		if (name) return name;
		return activeConversationId ? `Conversation #${activeConversationId}` : 'Messages';
	}, [activeConversation?.otherUser?.firstName, activeConversation?.otherUser?.lastName, activeConversationId]);

	const [messages, setMessages] = useState<ConversationMessageDto[] | null>(null);
	const [messagesError, setMessagesError] = useState<string | null>(null);
	const [draft, setDraft] = useState('');

	const messagesScrollRef = useRef<HTMLDivElement | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const scrollMessagesToBottom = (behavior: ScrollBehavior = 'auto') => {
		// Prefer sentinel scroll; fall back to container.
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
			return;
		}
		const el = messagesScrollRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior });
	};

	// Sync selected conversation with route parameter changes.
	useEffect(() => {
		setActiveConversationId(() => routeConversationId);
	}, [routeConversationId]);

	// Load conversation list
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const items = await listConversations();
				if (cancelled) return;
				setConversations(items);
			} catch (err) {
				if (cancelled) return;
				console.warn('[Conversation] failed to list conversations:', err);
				setConversations([]);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	// /messages?user2id=18 => /messages/{conversationId}
	useEffect(() => {
		const rawUser2Id = searchParams.get('user2id');
		if (!rawUser2Id) return;

		const user2Id = Number(rawUser2Id);
		if (!Number.isFinite(user2Id)) return;

		let cancelled = false;
		(async () => {
			try {
				const conv = await createOrGetConversation(user2Id);
				if (cancelled) return;

				if (pathname === '/messages') {
					router.replace(`/messages/${conv.id}`);
				}
			} catch (err) {
				if (cancelled) return;
				console.warn('[Conversation] failed to resolve conversationId from user2id:', err);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [pathname, router, searchParams]);

	// SignalR connect (proof)
	useEffect(() => {
		let connection: HubConnection | null = null;
		let cancelled = false;

		(async () => {
			try {
				// createChatHubConnection already starts the shared connection.
				connection = await createChatHubConnection();
				if (cancelled) return;
				console.info('[ChatHub] connected (via createChatHubConnection):', {
					connectionId: connection.connectionId,
					url: 'http://localhost:5273/hubs/chat',
				});
			} catch (err) {
				if (cancelled) return;
				console.error('[ChatHub] failed to connect:', err);
			}
		})();

		return () => {
			// Don't stop the shared connection here — other pieces of the app may rely on it.
			cancelled = true;
		};
	}, []);

	// Load messages for active conversation
	useEffect(() => {
		if (!activeConversationId) {
			setMessages(() => null);
			setMessagesError(() => null);
			return;
		}

		let cancelled = false;
		setMessages(() => null);
		setMessagesError(() => null);

		(async () => {
			try {
				const items = await getConversationMessages(activeConversationId);
				if (cancelled) return;
				setMessages(() => items);
			} catch (err) {
				if (cancelled) return;
				console.warn('[Conversation] failed to load messages:', err);
				setMessagesError(() => (err instanceof Error ? err.message : String(err)));
				setMessages(() => []);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [activeConversationId]);

	// When the conversation changes, snap to bottom quickly (placeholder while loading).
	useEffect(() => {
		if (!activeConversationId) return;
		// Defer to next paint so the container exists.
		requestAnimationFrame(() => scrollMessagesToBottom('auto'));
	}, [activeConversationId]);

	// Subscribe to incoming messages (receiver side)
	useEffect(() => {
		let off: (() => void) | null = null;
		let cancelled = false;

		(async () => {
			try {
				off = await chatHubOnMessageReceived((payload: MessageReceivedPayload) => {
					const msg = payload.message;

					// Refresh conversation list so unread badges update.
					listConversations()
						.then((items) => {
							if (cancelled) return;
							setConversations(items);
						})
						.catch((err) => {
							if (cancelled) return;
							console.warn('[Conversation] failed to refresh after MessageReceived:', err);
						});

					// Only append if it's for the currently open conversation.
					setMessages((prev) => {
						if (!prev) return prev;
						if (msg.conversationId !== activeConversationId) return prev;
						// Avoid duplicates.
						if (prev.some((m) => m.id === msg.id)) return prev;
						return [...prev, {
							id: msg.id,
							conversationId: msg.conversationId,
							senderUserId: msg.senderUserId,
							content: msg.content,
							sentAt: msg.sentAt,
							isRead: msg.isRead ?? false,
						}];
					});

					if (msg.conversationId === activeConversationId) {
						// Keep latest message visible.
						requestAnimationFrame(() => scrollMessagesToBottom('smooth'));

						// Mark as seen if the active chat is open (best-effort).
						chatHubMarkLastSeenMessage({
							conversationId: msg.conversationId,
							lastSeenMessageId: msg.id,
						}).catch((err) => {
							console.warn('[ChatHub] MarkLastSeenMessage failed:', err);
						});
					}
				});
			} catch (err) {
				if (cancelled) return;
				console.warn('[ChatHub] failed to subscribe MessageReceived:', err);
			}
		})();

		return () => {
			cancelled = true;
			if (off) off();
		};
	}, [activeConversationId]);

	// Subscribe to LastSeenUpdated (other participant read updates)
	useEffect(() => {
		let off: (() => void) | null = null;
		let cancelled = false;

		(async () => {
			try {
				off = await chatHubOnLastSeenUpdated((_payload: LastSeenUpdatedPayload) => {
					// For now just refresh conversations list to update unread badges.
					// (Backend computes unreadCount based on last-seen pointers.)
					listConversations()
						.then((items) => {
							if (cancelled) return;
							setConversations(items);
						})
						.catch((err) => {
							if (cancelled) return;
							console.warn('[Conversation] failed to refresh after LastSeenUpdated:', err);
						});
				});
			} catch (err) {
				if (cancelled) return;
				console.warn('[ChatHub] failed to subscribe LastSeenUpdated:', err);
			}
		})();

		return () => {
			cancelled = true;
			if (off) off();
		};
	}, []);

	// When messages are loaded for an opened chat, mark the latest message as seen (best-effort).
	useEffect(() => {
		if (!activeConversationId) return;
		if (!messages || messages.length === 0) return;

		// After first render of the loaded messages, scroll to bottom.
		requestAnimationFrame(() => scrollMessagesToBottom('auto'));

		const last = messages[messages.length - 1];
		if (!last?.id || last.id <= 0) return; // ignore optimistic temp ids

		chatHubMarkLastSeenMessage({
			conversationId: activeConversationId,
			lastSeenMessageId: last.id,
		}).catch((err) => {
			console.warn('[ChatHub] MarkLastSeenMessage failed:', err);
		});
	}, [activeConversationId, messages]);

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!activeConversationId) return;
		const content = draft.trim();
		if (!content) return;

		const sentAt = new Date().toISOString();

		// Optimistic UI append (server doesn't echo back to sender)
		setMessages((prev) => {
			const safe = prev ?? [];
			return [...safe, {
				id: -Date.now(),
				conversationId: activeConversationId,
				senderUserId: -1,
				content,
				sentAt,
				isRead: false,
			}];
		});
		setDraft('');

		// Keep latest message visible.
		requestAnimationFrame(() => scrollMessagesToBottom('smooth'));

		try {
			await chatHubSendMessage({
				conversationId: activeConversationId,
				content,
				sentAt,
			});
		} catch (err) {
			console.error('[ChatHub] SendMessage failed:', err);
			setMessagesError(err instanceof Error ? err.message : String(err));
		}
	};

	const conversationsLoaded = conversations !== null;

	const chatListItems = useMemo(() => {
		const formatChatTime = (iso: string): string => {
			if (!iso) return '';
			const d = new Date(iso);
			if (Number.isNaN(d.getTime())) return '';
			const now = new Date();
			const sameDay = d.toDateString() === now.toDateString();
			return sameDay
				? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
				: d.toLocaleDateString();
		};

		return (conversations ?? [])
			.filter((c) => {
				const name = `${c.otherUser?.firstName ?? ''} ${c.otherUser?.lastName ?? ''}`.trim().toLowerCase();
				const q = searchQuery.toLowerCase();
				if (!q) return true;
				if (!name) return true;
				return name.includes(q);
			})
			.map((c) => {
				const lastMessagePreview = (c.lastMessageFromOtherUser?.content ?? '').trim();
				const lastMessageAt = String(c.lastMessageFromOtherUser?.sentAt ?? '');
				return {
					key: `conv-${c.id}`,
					id: c.id,
					title: `${c.otherUser?.firstName ?? 'User'} ${c.otherUser?.lastName ?? ''}`.trim(),
					avatarUrl: DEFAULT_AVATAR_URL,
					unreadCount: Number(c.unreadCount ?? 0),
					lastMessagePreview,
					lastMessageTime: formatChatTime(lastMessageAt),
				};
			});
	}, [conversations, searchQuery]);

	const senderNameForMessage = (m: ConversationMessageDto): string => {
		// Optimistic placeholder (we don't currently know the real userId of the logged-in user here).
		if (m.senderUserId === -1) return 'You';

		const otherName = `${activeConversation?.otherUser?.firstName ?? ''} ${activeConversation?.otherUser?.lastName ?? ''}`.trim();
		// If the sender matches the other participant, show their name.
		if (activeConversation?.otherUser?.id && m.senderUserId === activeConversation.otherUser.id) {
			return otherName || 'Other user';
		}

		return `User #${m.senderUserId}`;
	};

	return (
		<div className="h-[calc(100dvh-80px)] min-h-[calc(100vh-80px)] overflow-hidden bg-background-dark flex flex-col md:flex-row">
			{/* Sidebar */}
			<div className={`w-full md:w-80 lg:w-96 border-r border-slate-border flex flex-col bg-slate-card/30 min-h-0 ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
				<div className="p-4 border-b border-slate-border">
					<h1 className="text-xl font-bold text-white mb-4">Сообщения</h1>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
						<input
							type="text"
							placeholder="Поиск сообщений..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 bg-background-dark border border-slate-border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
						/>
					</div>
				</div>

				<div className="flex-1 min-h-0 overflow-y-auto">
					{!conversationsLoaded ? (
						<div className="p-8 text-center text-slate-500 text-sm">Загрузка чатов...</div>
					) : chatListItems.length === 0 ? (
						<div className="p-8 text-center text-slate-500 text-sm">У вас пока нет чатов</div>
					) : (
						chatListItems.map(item => (
							<button
								key={item.key}
								onClick={() => {
									setActiveConversationId(() => item.id);
									router.push(`/messages/${item.id}`);
								}}
								className={`w-full text-left p-4 border-b border-slate-border/50 hover:bg-slate-800/50 transition-colors flex items-start gap-3 relative ${activeConversationId === item.id ? 'bg-slate-800/80' : ''}`}
							>
								<div className="relative shrink-0">
									<Image
										src={item.avatarUrl}
										alt={item.title}
										width={48}
										height={48}
										className="rounded-full border border-slate-border object-cover"
									/>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between gap-2">
										<h3 className="text-sm font-bold text-white truncate pr-2">{item.title}</h3>
										{item.lastMessageTime && (
											<span className="shrink-0 text-xs text-slate-500">{item.lastMessageTime}</span>
										)}
										{item.unreadCount > 0 && (
											<span className="shrink-0 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-primary text-white text-xs font-bold">
												{item.unreadCount}
											</span>
										)}
									</div>
									{item.lastMessagePreview && (
										<p className="text-xs text-slate-400 truncate mt-1 pr-2">
											{item.lastMessagePreview}
										</p>
									)}
								</div>
							</button>
						))
					)}
				</div>
			</div>

			{/* Main */}
			<div className={`flex-1 flex flex-col bg-background-dark min-h-0 overflow-hidden ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
				{!activeConversationId ? (
					<div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
						<div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
							<MessageSquare className="w-8 h-8 text-slate-400" />
						</div>
						<h2 className="text-lg font-bold text-white mb-2">Ваши сообщения</h2>
						<p className="text-sm max-w-md">Выберите чат из списка слева, чтобы начать общение.</p>
					</div>
				) : (
					<>
						<div className="h-16 border-b border-slate-border flex items-center justify-between px-4 sm:px-6 bg-slate-card/30 shrink-0">
							<div className="flex items-center gap-3">
								<button
									onClick={() => setActiveConversationId(() => null)}
									className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
								>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
								</button>
								<h2 className="text-sm font-bold text-white">{activeConversationTitle}</h2>
							</div>
						</div>

						{/* Scrollable message list */}
						<div ref={messagesScrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
							{messagesError && (
								<div className="text-sm text-red-400">{messagesError}</div>
							)}

							{messages === null ? (
								<div className="text-sm text-slate-500">Загрузка сообщений...</div>
							) : messages.length === 0 ? (
								<div className="text-sm text-slate-500">Нет сообщений</div>
							) : (
								messages.map((m) => (
									<div key={m.id} className="bg-slate-800/50 border border-slate-border rounded-xl p-3">
										<div className="text-xs text-slate-500 mb-1">
											{senderNameForMessage(m)} • {new Date(m.sentAt).toLocaleString()}
										</div>
										<div className="text-sm text-slate-200 whitespace-pre-wrap">{m.content}</div>
									</div>
								))
							)}
							{messages !== null && messages.length > 0 && <div ref={messagesEndRef} />}
						</div>

						<div className="p-4 border-t border-slate-border bg-slate-card/30 shrink-0">
							<form onSubmit={handleSend} className="flex items-end gap-2">
								<textarea
									value={draft}
									onChange={(e) => setDraft(e.target.value)}
									placeholder="Напишите сообщение..."
									className="flex-1 bg-slate-800/50 border border-slate-border rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none max-h-32 overflow-y-auto min-h-[46px]"
									rows={1}
								/>
								<button
									type="submit"
									disabled={!draft.trim()}
									className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
								>
									<Send className="w-5 h-5" />
								</button>
							</form>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
