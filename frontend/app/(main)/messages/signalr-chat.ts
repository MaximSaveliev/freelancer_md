'use client';

import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';

import { ensureAccessToken } from '@/lib/session';
import { getCookie, decodeCookieValue } from '@/lib/cookie';

const HUB_URL = 'http://localhost:5273/hubs/chat';
const ACCESS_COOKIE = 'accessToken';

function getAccessTokenFromCookie(): string | null {
  const raw = getCookie(ACCESS_COOKIE);
  return raw ? decodeCookieValue(raw) : null;
}

let sharedConnection: HubConnection | null = null;
let starting: Promise<HubConnection> | null = null;

export type SendMessageRequest = {
  conversationId: number;
  content: string;
  sentAt: string; // ISO
};

export type MessageDto = {
  id: number;
  conversationId: number;
  senderUserId: number;
  content: string;
  sentAt: string;
  isRead?: boolean;
};

export type MessageReceivedPayload = {
  message: MessageDto;
  unreadCount: number;
  unreadMessages: MessageDto[];
};

export type MarkLastSeenMessageRequest = {
  conversationId: number;
  lastSeenMessageId: number;
};

export type LastSeenUpdatedPayload = {
  conversationId: number;
  userId: number;
  lastSeenMessageId: number;
};

export async function getChatHubConnection(): Promise<HubConnection> {
  if (sharedConnection && sharedConnection.state === 'Connected') return sharedConnection;
  if (starting) return starting;

  starting = (async () => {
    try {
      await ensureAccessToken();
    } catch {
      // ignore
    }

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // SignalR will send access_token query param for WS/SSE.
        accessTokenFactory: () => getAccessTokenFromCookie() ?? '',
      })
      .configureLogging(LogLevel.Information)
      .build();

    connection.onclose((err) => {
      if (err) {
        console.warn('[ChatHub] disconnected with error:', err);
      } else {
        console.info('[ChatHub] disconnected');
      }
    });

    await connection.start();
    console.info('[ChatHub] connected:', { connectionId: connection.connectionId, url: HUB_URL });

    sharedConnection = connection;
    return connection;
  })().finally(() => {
    starting = null;
  });

  return starting;
}

/**
 * Invoke hub method SendMessage.
 * Note: per docs the server DOES NOT echo to sender, so the caller should optimistically append.
 */
export async function chatHubSendMessage(req: SendMessageRequest): Promise<void> {
  const conn = await getChatHubConnection();
  await conn.invoke('SendMessage', req);
}

export async function chatHubOnMessageReceived(handler: (payload: MessageReceivedPayload) => void): Promise<() => void> {
  const conn = await getChatHubConnection();
  conn.on('MessageReceived', handler);

  return () => {
    conn.off('MessageReceived', handler);
  };
}

/**
 * Invoke hub method MarkLastSeenMessage.
 */
export async function chatHubMarkLastSeenMessage(req: MarkLastSeenMessageRequest): Promise<void> {
  const conn = await getChatHubConnection();
  await conn.invoke('MarkLastSeenMessage', req);
}

export async function chatHubOnLastSeenUpdated(
  handler: (payload: LastSeenUpdatedPayload) => void,
): Promise<() => void> {
  const conn = await getChatHubConnection();
  conn.on('LastSeenUpdated', handler);

  return () => {
    conn.off('LastSeenUpdated', handler);
  };
}

// Backwards-compatible export used elsewhere.
export async function createChatHubConnection(): Promise<HubConnection> {
  return getChatHubConnection();
}
