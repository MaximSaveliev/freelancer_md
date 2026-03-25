using DAL.Models;

namespace BLL.Services;

public interface IConversationService
{
    Task<Conversation> CreateOrGetAsync(int user1Id, int user2Id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int user1Id, int user2Id, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(int conversationId, CancellationToken cancellationToken = default);
    Task<Conversation?> GetByIdAsync(int conversationId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Conversation>> GetConversationsAsync(int requestingUserId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns messages for a conversation if the requesting user is a participant (user1 or user2).
    /// </summary>
    Task<IReadOnlyList<Message>> GetMessagesAsync(int conversationId, int requestingUserId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(Conversation Conversation, int UnreadCount, Message? LastMessageFromOtherUser)>>
        GetConversationSummariesAsync(int requestingUserId, CancellationToken cancellationToken = default);

    Task UpdateLastSeenMessageAsync(
        int conversationId,
        int requestingUserId,
        int lastSeenMessageId,
        CancellationToken cancellationToken = default);
}
