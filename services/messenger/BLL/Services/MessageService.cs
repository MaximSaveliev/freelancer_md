using BLL.DTOs.Message;
using DAL.Interfaces;
using DAL.Models;

namespace BLL.Services;

public sealed class MessageService : IMessageService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IMessageRepository _messageRepository;

    public MessageService(IConversationRepository conversationRepository, IMessageRepository messageRepository)
    {
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
    }

    public async Task<Message> CreateAsync(CreateMessageDto messageDto, CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(messageDto.ConversationId, cancellationToken);
        if (conversation is null)
            throw new KeyNotFoundException("Conversation not found.");

        var isParticipant = conversation.User1Id == messageDto.SenderUserId || conversation.User2Id == messageDto.SenderUserId;
        if (!isParticipant)
            throw new UnauthorizedAccessException("User does not have permission for this conversation.");

        var message = new Message
        {
            ConversationId = messageDto.ConversationId,
            SenderUserId = messageDto.SenderUserId,
            Content = messageDto.Content.Trim(),
            SentAt = messageDto.SentAt,
            IsRead = false
        };

        return await _messageRepository.AddAsync(message, cancellationToken);
    }

    public async Task<IReadOnlyList<Message>> GetUnreadForUserAsync(
        int conversationId,
        int userId,
        int? lastSeenMessageId,
        CancellationToken cancellationToken = default)
    {
        // Note: Conversation membership checks are performed in CreateAsync and in ConversationService.
        // For unread queries we keep it as a simple data access call.
        return await _messageRepository.GetUnreadForUserAsync(conversationId, userId, lastSeenMessageId, cancellationToken);
    }
}