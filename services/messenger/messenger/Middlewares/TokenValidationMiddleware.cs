using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BLL.DTOs.User;
using messenger.Settings;
using Microsoft.IdentityModel.Tokens;

namespace messenger.Middlewares;

public class TokenValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly JwtSettings _jwtSettings;

    public TokenValidationMiddleware(
        RequestDelegate next, 
        JwtSettings jwtOptions
        )
    {
        _next = next;
        _jwtSettings = jwtOptions;
    }

    public async Task InvokeAsync(HttpContext context)
{
    var path = context.Request.Path;

    // This middleware is intended for HTTP API (controllers) only.
    // Never run it for SignalR hubs (negotiate or websocket upgrades).
    if (path.StartsWithSegments("/hubs"))
    {
        await _next(context);
        return;
    }

    string? token = null;

    var authHeader = context.Request.Headers["Authorization"].ToString();
    if (!string.IsNullOrEmpty(authHeader) &&
        authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    {
        token = authHeader["Bearer ".Length..].Trim();
    }

    if (!string.IsNullOrEmpty(token))
    {
        var handler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey)),
            ValidateIssuer = !string.IsNullOrWhiteSpace(_jwtSettings.Issuer),
            ValidIssuer = _jwtSettings.Issuer,
            ValidateAudience = !string.IsNullOrWhiteSpace(_jwtSettings.Audience),
            ValidAudience = _jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(15)
        };

        try
        {
            var principal = handler.ValidateToken(token, validationParameters, out _);
            context.User = principal;

            var idClaim = principal.FindFirst("userId")?.Value;
            if (!string.IsNullOrWhiteSpace(idClaim) && int.TryParse(idClaim, out var userId))
                context.Items["User"] = new UserViewDTO
                {
                    Id = userId,
                    Email = principal.FindFirst(ClaimTypes.Email)?.Value ?? ""
                };
        }
        catch
        {
            // leave unauthenticated
        }
    }

    await _next(context);
}
}