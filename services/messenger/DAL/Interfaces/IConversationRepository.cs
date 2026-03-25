using DAL.Models;

namespace DAL.Interfaces;

public interface IConversationRepository
{
    Task<bool> ExistsAsync(int user1Id, int user2Id, CancellationToken cancellationToken = default);
    Task<Conversation?> GetByUsersAsync(int user1Id, int user2Id, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(int conversationId, CancellationToken cancellationToken = default);
    Task<Conversation?> GetByIdAsync(int conversationId, CancellationToken cancellationToken = default);

    Task<Conversation> AddAsync(Conversation conversation, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Conversation>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Conversation>> GetByUserIdAsync(int userId, bool includeUsers, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns conversations for a user with the last message in each conversation.
    /// </summary>
    Task<IReadOnlyList<Conversation>> GetByUserIdWithLastMessageAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns conversations for a user with the last message and unread message count for that user.
    /// Unread is computed as messages after the user's last-seen message id.
    /// </summary>
    Task<IReadOnlyList<(Conversation Conversation, int UnreadCount, Message? LastMessageFromOtherUser)>>
        GetConversationSummariesAsync(int userId, CancellationToken cancellationToken = default);

    Task UpdateLastSeenMessageAsync(
        int conversationId,
        int userId,
        int lastSeenMessageId,
        CancellationToken cancellationToken = default);
}
