using BLL.DTOs.Message;
using DAL.Models;

namespace BLL.Services;

public interface IMessageService
{
    Task<Message> CreateAsync(CreateMessageDto createMessageDto, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Message>> GetUnreadForUserAsync(
        int conversationId,
        int userId,
        int? lastSeenMessageId,
        CancellationToken cancellationToken = default);
}
