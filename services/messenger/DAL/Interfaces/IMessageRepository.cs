using DAL.Models;

namespace DAL.Interfaces;

public interface IMessageRepository
{
    Task<IReadOnlyList<Message>> GetByConversationIdAsync(int conversationId, CancellationToken cancellationToken = default);
    Task<Message> AddAsync(Message message, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Message>> GetUnreadForUserAsync(
        int conversationId,
        int userId,
        int? lastSeenMessageId,
        CancellationToken cancellationToken = default);
}
