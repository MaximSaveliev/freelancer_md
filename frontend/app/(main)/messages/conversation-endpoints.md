# Conversation endpoints (API)

This document lists **only** the Conversation API endpoints and explains how each one works.

Controller: `messenger/Controllers/ConversationController.cs`

Base route:

- `/api/Conversation`

Development URLs (from `messenger/Properties/launchSettings.json`):

- HTTP: `http://localhost:5273`
- HTTPS profile: `https://localhost:44378` and `http://localhost:44377`

---

## Authentication (applies to all endpoints)

`ConversationController` is protected with `[RequireAuthentication]`.

### Request requirement

Send a JWT in the header:

- `Authorization: Bearer <JWT>`

The token must include claim:

- `userId` (integer)

### Unauthorized response

If missing/invalid:

- `401 Unauthorized`

---

## 1) Get all conversations for the current user

### Endpoint

- **GET** `/api/Conversation`

### How it works

- Reads the authenticated user id from `HttpContext.Items["User"]` (via `HttpContext.GetUser()`).
- Loads all conversations where the current user is a participant.
- For each conversation:
  - computes the **other participant** (the user that is *not* the authenticated user) and returns it as `otherUser`
  - returns the **last message sent by the other user** as `lastMessageFromOtherUser` (or `null` if none)
  - returns `unreadCount` = how many messages from the other user are **after the user’s last-seen message id** (if last-seen is `null`, counts all other-user messages)

### Response (200 OK)

Returns a JSON array of:

- `id` (int)
- `user1Id` (int)
- `user2Id` (int)
- `createdAt` (DateTime)
- `user1LastSeenMessageId` (int?)
- `user2LastSeenMessageId` (int?)
- `otherUser` (object|null)
  - `id` (int)
  - `firstName` (string)
  - `lastName` (string)
  - `createdAt` (DateTime)
- `lastMessageFromOtherUser` (object|null)
  - `id` (int)
  - `conversationId` (int)
  - `senderUserId` (int)
  - `content` (string)
  - `sentAt` (DateTime)
  - `isRead` (bool)
- `unreadCount` (int)

Example shape:

```json
[
  {
    "id": 10,
    "user1Id": 1,
    "user2Id": 2,
    "createdAt": "2026-03-24T10:15:30Z",
    "user1LastSeenMessageId": null,
    "user2LastSeenMessageId": 55,
    "otherUser": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2026-01-01T12:00:00Z"
    },
    "lastMessageFromOtherUser": {
      "id": 123,
      "conversationId": 10,
      "senderUserId": 2,
      "content": "Hey!",
      "sentAt": "2026-03-24T10:17:00Z",
      "isRead": false
    },
    "unreadCount": 3
  }
]
```

### Errors

- `401 Unauthorized` if the request is not authenticated
- `400 Bad Request` with body `{ "error": "<message>" }` for unexpected errors

---

## 2) Create or get a conversation

### Endpoint

- **POST** `/api/Conversation/create-or-get`

### How it works

- `user1Id` is the authenticated user (`HttpContext.GetUser().Id`).
- `user2Id` is provided by the client.
- Creates a conversation between the two users if it doesn’t exist, otherwise returns the existing conversation.

### Parameters

Query:

- `user2Id` (int, required)

### Response (200 OK)

Returns:

- `id` (int)
- `user1Id` (int)
- `user2Id` (int)
- `createdAt` (DateTime)

### Errors

- `400 Bad Request` with body `{ "error": "<message>" }`

---

## 3) Get messages in a conversation

### Endpoint

- **GET** `/api/Conversation/{conversationId:int}/messages`

### How it works

- Reads the authenticated user id.
- Returns all messages for the conversation **only if** the authenticated user is either `User1Id` or `User2Id` for that conversation.

### Parameters

Route:

- `conversationId` (int, required)

### Response (200 OK)

Returns a JSON array of messages with:

- `id` (int)
- `conversationId` (int)
- `senderUserId` (int)
- `content` (string)
- `sentAt` (DateTime)
- `isRead` (bool)

### Errors

- `404 Not Found` with body `{ "error": "<message>" }` when the conversation doesn’t exist
- `403 Forbidden` when the user is not a participant in the conversation
- `400 Bad Request` with body `{ "error": "<message>" }` for unexpected errors

