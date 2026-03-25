using System;

namespace messenger.Contracts;

public sealed record MessageDto(
    int Id,
    int ConversationId,
    int SenderUserId,
    string Content,
    DateTime SentAt);

