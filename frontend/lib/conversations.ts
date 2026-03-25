'use client';

import { MESSENGER_HOST } from '@/lib/env';
import { authFetch } from '@/lib/auth-fetch';
import { getCookie, decodeCookieValue } from '@/lib/cookie';
import { decodeJwtPayload } from '@/lib/jwt';

export type OtherUserDto = {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
};

export type ConversationDto = {
  id: number;
  user1Id: number;
  user2Id: number;
  createdAt: string;
  user1LastSeenMessageId?: number | null;
  user2LastSeenMessageId?: number | null;
  otherUser?: OtherUserDto | null;

  // Optional fields some backends include for listing views
  lastMessageId?: number | null;
  unreadCount?: number | null;

  // Documented by ConversationController: last message sent by the other user
  lastMessageFromOtherUser?: ConversationMessageDto | null;
};

export type ConversationMessageDto = {
  id: number;
  conversationId: number;
  senderUserId: number;
  content: string;
  sentAt: string;
  isRead: boolean;
};

function conversationUrl(path: string): string {
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return `${MESSENGER_HOST}/api/Conversation${cleaned}`;
}

const ACCESS_COOKIE = 'accessToken';

function getCurrentUserIdFromAccessToken(): number | null {
  try {
    const raw = getCookie(ACCESS_COOKIE);
    if (!raw) return null;
    const token = decodeCookieValue(raw);
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    const id = (payload.sub ?? payload.id ?? payload.userId ?? payload.user_id ?? payload.nameid) as unknown;
    if (typeof id === 'number') return id;
    if (typeof id === 'string' && id !== '') {
      const n = Number(id);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  } catch {
    return null;
  }
}

function ensureString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

function normalizeConversation(item: any, currentUserId: number | null): ConversationDto {
  // Best-effort extraction of fields from various possible shapes
  const id = Number(item.id ?? item.conversationId ?? item.conversation_id ?? item.id?.toString?.() ?? NaN) || 0;

  // Try to find other user info.
  let otherUser: OtherUserDto | null = null;

  const pickUser = (u: any) => {
    if (!u) return null;
    const uid = Number(u.id ?? u.userId ?? u.user_id ?? u.id?.toString?.());
    const firstName = u.firstName ?? u.first_name ?? u.givenName ?? u.name ?? '';
    const lastName = u.lastName ?? u.last_name ?? u.familyName ?? '';
    const createdAt = u.createdAt ?? u.created_at ?? '';
    if (!uid) return null;
    return {
      id: uid,
      firstName: ensureString(firstName),
      lastName: ensureString(lastName),
      createdAt: ensureString(createdAt),
    } as OtherUserDto;
  };

  if (item.otherUser) {
    otherUser = pickUser(item.otherUser) ?? null;
  } else if (item.other_user) {
    otherUser = pickUser(item.other_user) ?? null;
  } else if (Array.isArray(item.participants) && item.participants.length > 0) {
    // If we have currentUserId, pick participant with id !== currentUserId, otherwise pick first other.
    const found = (item.participants as any[]).find(p => {
      const pid = Number(p.id ?? p.userId ?? p.user_id);
      return currentUserId != null ? pid !== currentUserId : true;
    }) ?? item.participants[0];
    otherUser = pickUser(found) ?? null;
  } else if (Array.isArray(item.users) && item.users.length > 0) {
    const found = (item.users as any[]).find(p => {
      const pid = Number(p.id ?? p.userId ?? p.user_id);
      return currentUserId != null ? pid !== currentUserId : true;
    }) ?? item.users[0];
    otherUser = pickUser(found) ?? null;
  } else if (item.user2) {
    otherUser = pickUser(item.user2) ?? null;
  } else if (item.user) {
    // fallback
    otherUser = pickUser(item.user) ?? null;
  }

  const user1Id = Number(item.user1Id ?? item.user1_id ?? item.user1 ?? item.user1Id ?? 0) || 0;
  const user2Id = Number(item.user2Id ?? item.user2_id ?? item.user2 ?? item.user2Id ?? 0) || 0;

  const lastMessageId = Number(item.lastMessageId ?? item.last_message_id ?? item.last_message?.id ?? item.lastMessage?.id ?? NaN);
  const unreadCount = Number(item.unreadCount ?? item.unread_count ?? item.unread ?? NaN);

  const rawLastMessage = item.lastMessageFromOtherUser ?? item.last_message_from_other_user ?? item.lastMessageFromOtheruser ?? null;
  const lastMessageFromOtherUser: ConversationMessageDto | null = rawLastMessage
    ? {
        id: Number(rawLastMessage.id ?? 0),
        conversationId: Number(rawLastMessage.conversationId ?? rawLastMessage.conversation_id ?? id),
        senderUserId: Number(rawLastMessage.senderUserId ?? rawLastMessage.sender_user_id ?? 0),
        content: String(rawLastMessage.content ?? ''),
        sentAt: String(rawLastMessage.sentAt ?? rawLastMessage.sent_at ?? ''),
        isRead: Boolean(rawLastMessage.isRead ?? rawLastMessage.is_read ?? false),
      }
    : null;

  const conversation: ConversationDto = {
    id,
    user1Id,
    user2Id,
    createdAt: item.createdAt ?? item.created_at ?? '',
    user1LastSeenMessageId: item.user1LastSeenMessageId ?? item.user1_last_seen_message_id ?? null,
    user2LastSeenMessageId: item.user2LastSeenMessageId ?? item.user2_last_seen_message_id ?? null,
    otherUser,

    lastMessageId: Number.isFinite(lastMessageId) ? lastMessageId : null,
    unreadCount: Number.isFinite(unreadCount) ? unreadCount : null,

    lastMessageFromOtherUser,
  };

  return conversation;
}

/**
 * GET /api/Conversation
 */
export async function listConversations(): Promise<ConversationDto[]> {
  const url = conversationUrl('/');
  console.info('[Conversation] GET', url);

  const res = await authFetch(url, {
    method: 'GET',
  });

  console.info('[Conversation] GET status', res.status, res.statusText);

  const raw = await res.text().catch(() => '');
  console.info('[Conversation] GET raw body', raw);

  if (!res.ok) {
    throw new Error(`listConversations failed: ${res.status} ${res.statusText}${raw ? ` - ${raw}` : ''}`);
  }

  try {
    const json = JSON.parse(raw) as any[];
    console.info('[Conversation] GET parsed (raw)', json);

    const currentUserId = getCurrentUserIdFromAccessToken();
    const normalized = (json ?? []).map(item => normalizeConversation(item, currentUserId));
    console.info('[Conversation] GET normalized', normalized);
    return normalized;
  } catch (e) {
    throw new Error(`listConversations: failed to parse JSON (${String(e)}). Raw: ${raw}`);
  }
}

/**
 * POST /api/Conversation/create-or-get?user2Id=...
 */
export async function createOrGetConversation(user2Id: number): Promise<ConversationDto> {
  const res = await authFetch(conversationUrl(`/create-or-get?user2Id=${encodeURIComponent(user2Id)}`), {
    method: 'POST',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`createOrGetConversation failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
  }

  return res.json() as Promise<ConversationDto>;
}

/**
 * GET /api/Conversation/{conversationId}/messages
 */
export async function getConversationMessages(conversationId: number): Promise<ConversationMessageDto[]> {
  const url = conversationUrl(`/${encodeURIComponent(conversationId)}/messages`);
  console.info('[Conversation] GET', url);

  const res = await authFetch(url, { method: 'GET' });
  console.info('[Conversation] GET messages status', res.status, res.statusText);

  const raw = await res.text().catch(() => '');
  console.info('[Conversation] GET messages raw body', raw);

  if (!res.ok) {
    throw new Error(`getConversationMessages failed: ${res.status} ${res.statusText}${raw ? ` - ${raw}` : ''}`);
  }

  try {
    const json = JSON.parse(raw) as ConversationMessageDto[];
    console.info('[Conversation] GET messages parsed', json);
    return json;
  } catch (e) {
    throw new Error(`getConversationMessages: failed to parse JSON (${String(e)}). Raw: ${raw}`);
  }
}
