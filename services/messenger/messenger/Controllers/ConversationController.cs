using BLL.Services;
using DAL.Models;
using messenger.Attributes;
using messenger.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace messenger.Controllers;

[ApiController]
[Route("api/[controller]")]
[RequireAuthentication]
public sealed class ConversationController : ControllerBase
{
    private readonly IConversationService _conversationService;

    public ConversationController(IConversationService conversationService)
    {
        _conversationService = conversationService;
    }

    /// <summary>
    /// Creates a conversation between 2 users if it doesn't exist, otherwise returns the existing one.
    /// </summary>
    [HttpPost("create-or-get")]
    public async Task<IActionResult> CreateOrGet([FromQuery] int user2Id, CancellationToken cancellationToken)
    {
        try
        {
            int user1Id = HttpContext.GetUser()!.Id;
            Conversation conversation = await _conversationService.CreateOrGetAsync(user1Id, user2Id, cancellationToken);

            return Ok(new
            {
                conversation.Id,
                conversation.User1Id,
                conversation.User2Id,
                conversation.CreatedAt
            });
        }
        catch (Exception e)
        {
            return BadRequest(new { error = e.Message });
        }
    }

    /// <summary>
    /// Returns all messages from a conversation by conversation id.
    /// Requires that the requesting user is either User1 or User2 for the conversation.
    /// </summary>
    [HttpGet("{conversationId:int}/messages")]
    public async Task<IActionResult> GetMessages(
        [FromRoute] int conversationId,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = HttpContext.GetUser();
            if (user is null)
                return Unauthorized();

            var messages = await _conversationService.GetMessagesAsync(conversationId, user.Id, cancellationToken);

            return Ok(messages.Select(m => new
            {
                m.Id,
                m.ConversationId,
                m.SenderUserId,
                m.Content,
                m.SentAt,
                m.IsRead
            }));
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(new { error = e.Message });
        }
        catch (UnauthorizedAccessException e)
        {
            return Forbid(e.Message);
        }
        catch (Exception e)
        {
            return BadRequest(new { error = e.Message });
        }
    }

    /// <summary>
    /// Returns all conversations for the authenticated user.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetConversations(CancellationToken cancellationToken)
    {
        try
        {
            var user = HttpContext.GetUser();
            if (user is null)
                return Unauthorized();

            var summaries = await _conversationService.GetConversationSummariesAsync(user.Id, cancellationToken);

            return Ok(summaries.Select(s =>
            {
                var c = s.Conversation;
                var other = c.User1Id == user.Id ? c.User2 : c.User1;

                return new
                {
                    c.Id,
                    c.User1Id,
                    c.User2Id,
                    c.CreatedAt,
                    c.User1LastSeenMessageId,
                    c.User2LastSeenMessageId,
                    OtherUser = other is null
                        ? null
                        : new
                        {
                            other.Id,
                            other.FirstName,
                            other.LastName,
                            other.CreatedAt
                        },
                    LastMessageFromOtherUser = s.LastMessageFromOtherUser is null
                        ? null
                        : new
                        {
                            s.LastMessageFromOtherUser.Id,
                            s.LastMessageFromOtherUser.ConversationId,
                            s.LastMessageFromOtherUser.SenderUserId,
                            s.LastMessageFromOtherUser.Content,
                            s.LastMessageFromOtherUser.SentAt,
                            s.LastMessageFromOtherUser.IsRead
                        },
                    UnreadCount = s.UnreadCount
                };
            }));
        }
        catch (Exception e)
        {
            return BadRequest(new { error = e.Message });
        }
    }
}
