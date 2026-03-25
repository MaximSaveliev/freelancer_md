using DAL.Models;
using Microsoft.EntityFrameworkCore;
using DAL.Interfaces;

namespace DAL.Repositories;

public sealed class ConversationRepository : IConversationRepository
{
    private readonly MessengerDbContext _db;

    public ConversationRepository(MessengerDbContext db)
    {
        _db = db;
    }

    public async Task<bool> ExistsAsync(int user1Id, int user2Id, CancellationToken cancellationToken = default)
    {
        return await _db.Conversations
            .AsNoTracking()
            .AnyAsync(c => c.User1Id == user1Id && c.User2Id == user2Id, cancellationToken);
    }

    public async Task<Conversation?> GetByUsersAsync(int user1Id, int user2Id, CancellationToken cancellationToken = default)
    {
        return await _db.Conversations
            .FirstOrDefaultAsync(c => c.User1Id == user1Id && c.User2Id == user2Id, cancellationToken);
    }

    public async Task<bool> ExistsAsync(int conversationId, CancellationToken cancellationToken = default)
    {
        return await _db.Conversations
            .AsNoTracking()
            .AnyAsync(c => c.Id == conversationId, cancellationToken);
    }

    public async Task<Conversation?> GetByIdAsync(int conversationId, CancellationToken cancellationToken = default)
    {
        return await _db.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId, cancellationToken);
    }

    public async Task<Conversation> AddAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        _db.Conversations.Add(conversation);
        await _db.SaveChangesAsync(cancellationToken);
        return conversation;
    }

    public Task<IReadOnlyList<Conversation>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        => GetByUserIdAsync(userId, includeUsers: false, cancellationToken);

    public async Task<IReadOnlyList<Conversation>> GetByUserIdAsync(int userId, bool includeUsers, CancellationToken cancellationToken = default)
    {
        var query = _db.Conversations
            .AsNoTracking()
            .Where(c => c.User1Id == userId || c.User2Id == userId);

        if (includeUsers)
        {
            query = query
                .Include(c => c.User1)
                .Include(c => c.User2);
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByUserIdWithLastMessageAsync(int userId, CancellationToken cancellationToken = default)
    {
        // Loads conversations + users. Last message is computed in GetConversationSummariesAsync.
        return await _db.Conversations
            .AsNoTracking()
            .Where(c => c.User1Id == userId || c.User2Id == userId)
            .Include(c => c.User1)
            .Include(c => c.User2)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<(Conversation Conversation, int UnreadCount, Message? LastMessageFromOtherUser)>>
        GetConversationSummariesAsync(int userId, CancellationToken cancellationToken = default)
    {
        // We project to avoid loading full Messages collections.
        var summaries = await _db.Conversations
            .AsNoTracking()
            .Where(c => c.User1Id == userId || c.User2Id == userId)
            .Include(c => c.User1)
            .Include(c => c.User2)
            .Select(c => new
            {
                Conversation = c,
                LastSeenMessageId = c.User1Id == userId ? c.User1LastSeenMessageId : c.User2LastSeenMessageId,

                LastMessageFromOtherUser = _db.Messages
                    .AsNoTracking()
                    .Where(m => m.ConversationId == c.Id && m.SenderUserId != userId)
                    .OrderByDescending(m => m.SentAt)
                    .Select(m => new Message
                    {
                        Id = m.Id,
                        ConversationId = m.ConversationId,
                        SenderUserId = m.SenderUserId,
                        Content = m.Content,
                        SentAt = m.SentAt,
                        IsRead = m.IsRead,
                        CreatedAt = m.CreatedAt
                    })
                    .FirstOrDefault(),

                LastMessageAny = _db.Messages
                    .AsNoTracking()
                    .Where(m => m.ConversationId == c.Id)
                    .OrderByDescending(m => m.SentAt)
                    .Select(m => (DateTime?)m.SentAt)
                    .FirstOrDefault(),

                UnreadCount = _db.Messages
                    .AsNoTracking()
                    .Where(m => m.ConversationId == c.Id && m.SenderUserId != userId)
                    .Where(m =>
                        (c.User1Id == userId ? c.User1LastSeenMessageId : c.User2LastSeenMessageId) == null ||
                        m.Id > (c.User1Id == userId ? c.User1LastSeenMessageId : c.User2LastSeenMessageId)!)
                    .Count()
            })
            .ToListAsync(cancellationToken);

        return summaries
            .OrderByDescending(s => s.LastMessageAny ?? s.Conversation.CreatedAt)
            .Select(s => (s.Conversation, s.UnreadCount, s.LastMessageFromOtherUser))
            .ToList();
    }

    public async Task UpdateLastSeenMessageAsync(
        int conversationId,
        int userId,
        int lastSeenMessageId,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _db.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId, cancellationToken);
        if (conversation is null)
            throw new KeyNotFoundException("Conversation not found.");

        var isUser1 = conversation.User1Id == userId;
        var isUser2 = conversation.User2Id == userId;
        if (!isUser1 && !isUser2)
            throw new UnauthorizedAccessException("User is not a participant in this conversation.");

        if (isUser1)
        {
            if (conversation.User1LastSeenMessageId is null || lastSeenMessageId > conversation.User1LastSeenMessageId)
                conversation.User1LastSeenMessageId = lastSeenMessageId;
        }
        else
        {
            if (conversation.User2LastSeenMessageId is null || lastSeenMessageId > conversation.User2LastSeenMessageId)
                conversation.User2LastSeenMessageId = lastSeenMessageId;
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}
