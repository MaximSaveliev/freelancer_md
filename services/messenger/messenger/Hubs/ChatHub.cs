using BLL.DTOs.Message;
using BLL.Services;
using DAL.Interfaces;
using messenger.Extensions;
using messenger.Services;
using messenger.Settings;
using Microsoft.AspNetCore.SignalR;

namespace messenger.Hubs;

public sealed class ChatHub : Hub
{
    private readonly IMessageService _messageService;
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserConnectionStore _connections;
    private readonly JwtSettings _jwtSettings;

    public ChatHub(
        IMessageService messageService,
        IUserConnectionStore connections,
        IConversationRepository conversationRepository,
        JwtSettings jwtSettings)
    {
        _messageService = messageService;
        _connections = connections;
        _conversationRepository = conversationRepository;
        _jwtSettings = jwtSettings;
    }

    private int GetUserIdFromConnectionOrThrow()
    {
        if (_connections.TryGetUserId(Context.ConnectionId, out var userId))
            return userId;  

        // If missing, treat it as unauthorized (shouldn't happen if OnConnectedAsync succeeded).
        throw new HubException("Unauthorized");
    }

    public override async Task OnConnectedAsync()
    {
        var http = Context.GetHttpContext();
        var path = http?.Request.Path.ToString() ?? "";
        var qs = http?.Request.QueryString.ToString() ?? "";
        Console.WriteLine($"[ChatHub] OnConnectedAsync. ConnectionId={Context.ConnectionId} {path}{qs}");

        // Preferred path: TokenValidationMiddleware already populated HttpContext.Items["User"].
        var user = http?.GetUser();
        if (user is not null)
        {
            _connections.Add(Context.ConnectionId, user.Id);
            await base.OnConnectedAsync();
            return;
        }

        // Fallback: validate access_token from query (common for WebSockets).
        // Note: this keeps the hub robust even if middleware doesn't run for some upgrade path.
        var accessToken = http?.Request.Query["access_token"].ToString();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            Console.Error.WriteLine($"[ChatHub] Missing access_token. Aborting. ConnectionId={Context.ConnectionId}");
            Context.Abort();
            return;
        }

        if (string.IsNullOrWhiteSpace(_jwtSettings.SecretKey))
        {
            Console.Error.WriteLine($"[ChatHub] JwtSettings.SecretKey missing. Aborting. ConnectionId={Context.ConnectionId}");
            Context.Abort();
            return;
        }

        try
        {
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var validationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_jwtSettings.SecretKey)),

                ValidateIssuer = !string.IsNullOrWhiteSpace(_jwtSettings.Issuer),
                ValidIssuer = _jwtSettings.Issuer,

                ValidateAudience = !string.IsNullOrWhiteSpace(_jwtSettings.Audience),
                ValidAudience = _jwtSettings.Audience,

                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(15)
            };

            var principal = handler.ValidateToken(accessToken, validationParameters, out _);

            var idClaim = principal.FindFirst("userId")?.Value;
            if (!string.IsNullOrWhiteSpace(idClaim) && int.TryParse(idClaim, out var userId))
            {
                _connections.Add(Context.ConnectionId, userId);
                await base.OnConnectedAsync();
                return;
            }

            Console.Error.WriteLine($"[ChatHub] Token missing userId claim. Aborting. ConnectionId={Context.ConnectionId}");
            Context.Abort();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[ChatHub] Token validation failed. ConnectionId={Context.ConnectionId} Error={ex.Message}");
            Context.Abort();
        }
    }
    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _connections.Remove(Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(SendMessageRequest sendMessageRequest)
    {
        try
        {
            var senderUserId = GetUserIdFromConnectionOrThrow();

            var createMessageDto = new CreateMessageDto(
                ConversationId: sendMessageRequest.ConversationId,
                SenderUserId: senderUserId,
                Content: sendMessageRequest.Content,
                SentAt: DateTime.UtcNow);

            var saved = await _messageService.CreateAsync(createMessageDto);

            // Forward to the receiver if they're connected (all their open chats/tabs/devices).
            var conversation = await _conversationRepository.GetByIdAsync(saved.ConversationId);
            if (conversation is not null)
            {
                var receiverUserId = conversation.User1Id == senderUserId ? conversation.User2Id : conversation.User1Id;
                var receiverConnections = _connections.GetConnections(receiverUserId);

                if (receiverConnections.Count > 0)
                {
                    var receiverLastSeen = conversation.User1Id == receiverUserId
                        ? conversation.User1LastSeenMessageId
                        : conversation.User2LastSeenMessageId;

                    // Unread = all messages from the other user after the receiver's last-seen pointer.
                    // Note: since we've just saved a message from senderUserId != receiverUserId, it will be included.
                    var unreadMessages = await _messageService.GetUnreadForUserAsync(
                        saved.ConversationId,
                        receiverUserId,
                        receiverLastSeen);

                    await Clients.Clients(receiverConnections).SendAsync("MessageReceived", new
                    {
                        Message = new
                        {
                            saved.Id,
                            saved.ConversationId,
                            saved.SenderUserId,
                            saved.Content,
                            saved.SentAt
                        },
                        UnreadCount = unreadMessages.Count,
                        UnreadMessages = unreadMessages.Select(m => new
                        {
                            m.Id,
                            m.ConversationId,
                            m.SenderUserId,
                            m.Content,
                            m.SentAt,
                            m.IsRead
                        })
                    });
                }
            }
        }
        catch (HubException)
        {
            // Preserve explicit HubException messages (e.g., Unauthorized from GetUserIdFromConnectionOrThrow)
            throw;
        }
        catch (UnauthorizedAccessException)
        {
            throw new HubException("You don't have permission for this conversation.");
        }
        catch (KeyNotFoundException)
        {
            throw new HubException("Conversation not found.");
        }
        catch (ArgumentException e)
        {
            throw new HubException(e.Message);
        }
        catch
        {
            throw new HubException("Failed to send message.");
        }
    }

    public async Task MarkLastSeenMessage(MarkLastSeenMessageRequest request)
    {
        try
        {
            var userId = GetUserIdFromConnectionOrThrow();

            if (request.LastSeenMessageId <= 0)
                throw new HubException("lastSeenMessageId must be a positive integer.");

            await _conversationRepository.UpdateLastSeenMessageAsync(
                request.ConversationId,
                userId,
                request.LastSeenMessageId);

            // Notify the other participant so they can update UI (e.g., read receipts / unread counters).
            var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId);
            if (conversation is null)
                return;

            var otherUserId = conversation.User1Id == userId ? conversation.User2Id : conversation.User1Id;
            var otherConnections = _connections.GetConnections(otherUserId);

            if (otherConnections.Count > 0)
            {
                await Clients.Clients(otherConnections).SendAsync("LastSeenUpdated", new
                {
                    ConversationId = request.ConversationId,
                    UserId = userId,
                    LastSeenMessageId = request.LastSeenMessageId
                });
            }
        }
        catch (HubException)
        {
            throw;
        }
        catch (UnauthorizedAccessException)
        {
            throw new HubException("You don't have permission for this conversation.");
        }
        catch (KeyNotFoundException)
        {
            throw new HubException("Conversation not found.");
        }
        catch (ArgumentException e)
        {
            throw new HubException(e.Message);
        }
        catch
        {
            throw new HubException("Failed to update last seen message.");
        }
    }

    public sealed record SendMessageRequest(
        int ConversationId,
        string Content
    );

    public sealed record MarkLastSeenMessageRequest(int ConversationId, int LastSeenMessageId);
}
