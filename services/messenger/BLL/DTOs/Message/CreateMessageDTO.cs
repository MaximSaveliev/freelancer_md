namespace BLL.DTOs.Message;

public sealed record CreateMessageDto(int ConversationId, int SenderUserId, string Content, DateTime SentAt);
