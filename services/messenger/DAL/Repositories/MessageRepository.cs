using DAL.Interfaces;
using DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories;

public sealed class MessageRepository : IMessageRepository
{
    private readonly MessengerDbContext _db;

    public MessageRepository(MessengerDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Message>> GetByConversationIdAsync(int conversationId, CancellationToken cancellationToken = default)
    {
        return await _db.Messages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.SentAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Message> AddAsync(Message message, CancellationToken cancellationToken = default)
    {
        _db.Messages.Add(message);
        await _db.SaveChangesAsync(cancellationToken);
        return message;
    }

    public async Task<IReadOnlyList<Message>> GetUnreadForUserAsync(
        int conversationId,
        int userId,
        int? lastSeenMessageId,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Messages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversationId)
            .Where(m => m.SenderUserId != userId);

        if (lastSeenMessageId is not null)
            query = query.Where(m => m.Id > lastSeenMessageId.Value);

        return await query
            .OrderBy(m => m.SentAt)
            .ToListAsync(cancellationToken);
    }
}
