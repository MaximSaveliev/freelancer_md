# ChatHub (SignalR): connection and message transmission

This document describes **how to connect** to the `ChatHub` SignalR endpoint and **how messages are transmitted** (methods, events, payload data, and error messages).

---

## 1) Connection URL (including http/https ports)

The hub is mapped in `messenger/Program.cs` as:

- `app.MapHub<ChatHub>("/hubs/chat");`

So the hub path is:

- **Path:** `/hubs/chat`

In Development, the service ports are defined in `messenger/Properties/launchSettings.json`:

### HTTP

- Base URL: `http://localhost:5273`
- Hub URL: `http://localhost:5273/hubs/chat`

### HTTPS

- Base URLs: `https://localhost:44378` and `http://localhost:44377`
- Hub URLs:
  - `https://localhost:44378/hubs/chat`
  - `http://localhost:44377/hubs/chat`

(Exact URL depends on which launch profile you run.)

---

## 2) Authentication for hub connections

`ChatHub` requires an authenticated user.

On connection (`OnConnectedAsync`), the hub reads the user from:

- `HttpContext.Items["User"]`

That value is set by `TokenValidationMiddleware`.

### Accepted token locations

The middleware accepts a JWT token either via:

1) HTTP header:

- `Authorization: Bearer <JWT>`

2) Query string (specifically for the hub endpoints):

- `/hubs/chat?access_token=<JWT>`
- `/hubs/chat/negotiate?access_token=<JWT>`

### Required JWT claim

The JWT must include:

- `userId` (integer)

### Unauthorized behavior

If no authenticated user is found during connect, the hub:

- aborts the connection (`Context.Abort()`), and
- throws `HubException("Unauthorized")`

---

## 3) Message transmission

### 3.1 Client → Server method: `SendMessage`

Hub method name:

- `SendMessage`

Parameter type is the **nested** record defined in `ChatHub`:

- `ChatHub.SendMessageRequest`

#### `SendMessageRequest` data

Fields:

- `conversationId` (int): the target conversation
- `content` (string): message text
- `sentAt` (DateTime): timestamp provided by the client

JSON shape:

```json
{
  "conversationId": 123,
  "content": "Hello!",
  "sentAt": "2026-03-24T10:15:30.000Z"
}
```

Important notes:

- The client **does not** send `senderUserId`. The server derives it from the authenticated connection.
- `sentAt` is accepted from the client and written as-is; use a consistent format (typically ISO 8601 / UTC) to avoid time drift.

#### What the server does on `SendMessage`

1. Resolves the sender user ID from the current SignalR connection.
2. Persists the message via `IMessageService.CreateAsync(...)`.
3. Loads the conversation to determine the receiver user ID:
   - if `conversation.User1Id == senderUserId` → receiver is `conversation.User2Id`
   - else receiver is `conversation.User1Id`
4. Forwards the saved message to **all active SignalR connections** of the receiver (multiple tabs/devices supported).

The hub forwards to the **receiver only** (it does not echo the message back to the sender).

---

### 3.2 Server → Client event: `MessageReceived`

Event name:

- `MessageReceived`

This event is emitted to the receiver’s active connections after the message is successfully saved.

#### `MessageReceived` payload data

The payload is an object with:

- `message` (object)
  - `id` (int)
  - `conversationId` (int)
  - `senderUserId` (int)
  - `content` (string)
  - `sentAt` (DateTime)
- `unreadCount` (int)
  - how many messages from the other user are currently considered **unread** in this conversation
- `unreadMessages` (array)
  - the current unread messages for the receiver in this conversation (messages sent by the other user and with `id` > receiver’s last-seen message id)
  - each item has:
    - `id` (int)
    - `conversationId` (int)
    - `senderUserId` (int)
    - `content` (string)
    - `sentAt` (DateTime)
    - `isRead` (bool)

JSON shape:

```json
{
  "message": {
    "id": 1,
    "conversationId": 123,
    "senderUserId": 42,
    "content": "Hello!",
    "sentAt": "2026-03-24T10:15:30.000Z"
  },
  "unreadCount": 3,
  "unreadMessages": [
    {
      "id": 1,
      "conversationId": 123,
      "senderUserId": 42,
      "content": "Hello!",
      "sentAt": "2026-03-24T10:15:30.000Z",
      "isRead": false
    }
  ]
}
```

Notes:

- `unreadCount` / `unreadMessages` are computed using the receiver’s last-seen pointer (`Conversation.User1LastSeenMessageId` / `Conversation.User2LastSeenMessageId`).
- Clients can call `MarkLastSeenMessage` after rendering messages to move the pointer forward and reduce unread counts.

---

### 3.3 Client → Server method: `MarkLastSeenMessage`

Use this method to tell the server that the **authenticated user** has seen messages up to a specific message id in a conversation.

Hub method name:

- `MarkLastSeenMessage`

Parameter type is the nested record defined in `ChatHub`:

- `ChatHub.MarkLastSeenMessageRequest`

#### `MarkLastSeenMessageRequest` data

Fields:

- `conversationId` (int): the conversation being viewed
- `lastSeenMessageId` (int): the last message id the user has seen (must be `> 0`)

JSON shape:

```json
{
  "conversationId": 123,
  "lastSeenMessageId": 55
}
```

#### What the server does on `MarkLastSeenMessage`

1. Resolves the authenticated `userId` from the SignalR connection.
2. Validates that the user is a participant in the conversation.
3. Updates the conversation’s last-seen pointer:
   - if the user is `User1Id` → updates `User1LastSeenMessageId`
   - if the user is `User2Id` → updates `User2LastSeenMessageId`

Notes:

- The server will **not move the pointer backwards** (it only updates if the new id is greater than the stored value).
- This value is used by `GET /api/Conversation` to compute `unreadCount`.

---

### 3.4 Server → Client event: `LastSeenUpdated`

When a user updates their last-seen message, the hub notifies the **other participant** (if connected) so they can update UI (read receipts, badges, etc.).

Event name:

- `LastSeenUpdated`

#### `LastSeenUpdated` payload data

- `conversationId` (int)
- `userId` (int): the user who updated their last seen pointer
- `lastSeenMessageId` (int)

JSON shape:

```json
{
  "conversationId": 123,
  "userId": 42,
  "lastSeenMessageId": 55
}
```

---

## 4) Errors returned by `SendMessage`

If something goes wrong, the hub throws a `HubException` with one of these messages:

- `"Unauthorized"`
  - connection wasn’t authenticated, or
  - connection wasn’t registered in the server’s connection store

- `"You don't have permission for this conversation."`
  - the sender isn’t allowed to send to that conversation (mapped from `UnauthorizedAccessException`)

- `"Conversation not found."`
  - the conversation ID doesn’t exist (mapped from `KeyNotFoundException`)

- `<validation message>`
  - any argument validation error (mapped from `ArgumentException.Message`)

- `"Failed to send message."`
  - any other unexpected error

---

## 5) Errors returned by hub methods

### Errors returned by `SendMessage`

If something goes wrong, the hub throws a `HubException` with one of these messages:

- `"Unauthorized"`
  - connection wasn’t authenticated, or
  - connection wasn’t registered in the server’s connection store

- `"You don't have permission for this conversation."`
  - the sender isn’t allowed to send to that conversation (mapped from `UnauthorizedAccessException`)

- `"Conversation not found."`
  - the conversation ID doesn’t exist (mapped from `KeyNotFoundException`)

- `<validation message>`
  - any argument validation error (mapped from `ArgumentException.Message`)

- `"Failed to send message."`
  - any other unexpected error

### Errors returned by `MarkLastSeenMessage`

If something goes wrong, the hub throws a `HubException` with one of these messages:

- `"Unauthorized"`
  - connection wasn’t authenticated, or
  - connection wasn’t registered in the server’s connection store

- `"You don't have permission for this conversation."`
  - the user isn’t a participant (mapped from `UnauthorizedAccessException`)

- `"Conversation not found."`
  - the conversation ID doesn’t exist (mapped from `KeyNotFoundException`)

- `<validation message>`
  - argument validation error (mapped from `ArgumentException.Message`, or explicit hub validation like `lastSeenMessageId must be a positive integer.`)

- `"Failed to update last seen message."`
  - any other unexpected error
