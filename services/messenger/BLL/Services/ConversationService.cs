using DAL.Models;
using DAL.Interfaces;

namespace BLL.Services;

public sealed class ConversationService : IConversationService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMessageRepository _messageRepository;

    public ConversationService(
        IConversationRepository conversationRepository,
        IUserRepository userRepository,
        IMessageRepository messageRepository)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _messageRepository = messageRepository;
    }

    public async Task<bool> ExistsAsync(int user1Id, int user2Id, CancellationToken cancellationToken = default)
    {
        var (a, b) = NormalizePair(user1Id, user2Id);
        return await _conversationRepository.ExistsAsync(a, b, cancellationToken);
    }

    public async Task<bool> ExistsAsync(int conversationId, CancellationToken cancellationToken = default)
        => await _conversationRepository.ExistsAsync(conversationId, cancellationToken);

    public async Task<Conversation?> GetByIdAsync(int conversationId, CancellationToken cancellationToken = default)
        => await _conversationRepository.GetByIdAsync(conversationId, cancellationToken);

    public async Task<Conversation> CreateOrGetAsync(int user1Id, int user2Id, CancellationToken cancellationToken = default)
    {
        var (a, b) = NormalizePair(user1Id, user2Id);

        var existing = await _conversationRepository.GetByUsersAsync(a, b, cancellationToken);
        if (existing is not null)
            return existing;

        if (!await _userRepository.ExistsAsync(user1Id, cancellationToken))
            throw new ArgumentException($"User with id {user1Id} does not exist.");

        if (!await _userRepository.ExistsAsync(user2Id, cancellationToken))
            throw new ArgumentException($"User with id {user2Id} does not exist.");

        var conversation = new Conversation
        {
            User1Id = a,
            User2Id = b,
            User1LastSeenMessageId = null,
            User2LastSeenMessageId = null
        };

        return await _conversationRepository.AddAsync(conversation, cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetConversationsAsync(
        int requestingUserId,
        CancellationToken cancellationToken = default)
    {
        return await _conversationRepository.GetByUserIdAsync(requestingUserId, includeUsers: true, cancellationToken);
    }

    public async Task<IReadOnlyList<Message>> GetMessagesAsync(
        int conversationId,
        int requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken);
        if (conversation is null)
            throw new KeyNotFoundException($"Conversation with id {conversationId} was not found.");

        var isParticipant = conversation.User1Id == requestingUserId || conversation.User2Id == requestingUserId;
        if (!isParticipant)
            throw new UnauthorizedAccessException("User is not a participant in this conversation.");

        return await _messageRepository.GetByConversationIdAsync(conversationId, cancellationToken);
    }

    public async Task<IReadOnlyList<(Conversation Conversation, int UnreadCount, Message? LastMessageFromOtherUser)>>
        GetConversationSummariesAsync(int requestingUserId, CancellationToken cancellationToken = default)
    {
        return await _conversationRepository.GetConversationSummariesAsync(requestingUserId, cancellationToken);
    }

    public async Task UpdateLastSeenMessageAsync(
        int conversationId,
        int requestingUserId,
        int lastSeenMessageId,
        CancellationToken cancellationToken = default)
    {
        if (lastSeenMessageId <= 0)
            throw new ArgumentException("lastSeenMessageId must be a positive integer.");

        await _conversationRepository.UpdateLastSeenMessageAsync(conversationId, requestingUserId, lastSeenMessageId, cancellationToken);
    }

    private static (int a, int b) NormalizePair(int user1Id, int user2Id)
        => user1Id < user2Id ? (user1Id, user2Id) : (user2Id, user1Id);
}
