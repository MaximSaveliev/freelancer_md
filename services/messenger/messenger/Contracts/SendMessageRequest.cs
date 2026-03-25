namespace messenger.Contracts;

public sealed record SendMessageRequest(int ConversationId, string Content);

