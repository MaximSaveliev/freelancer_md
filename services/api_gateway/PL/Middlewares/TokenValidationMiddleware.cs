using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BLL.DTOs.User;
using BLL.Settings;
using DAL.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;

namespace PL.Middlewares;

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
        var authHeader = context.Request.Headers["Authorization"].ToString();
        
        Console.WriteLine(authHeader);

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            var handler = new JwtSecurityTokenHandler();

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey)),
                ValidateIssuer = string.IsNullOrEmpty(_jwtSettings.Issuer),
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = string.IsNullOrEmpty(_jwtSettings.Audience),
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(15)
            };

            try
            {
                var principal = handler.ValidateToken(token, validationParameters, out _);
                context.User = principal;

                string idClaim = principal.FindFirst("userId")!.Value;
                string emailClaim = principal.FindFirst(ClaimTypes.Email)!.Value;
                
                if (int.TryParse(idClaim, out var userId))
                {
                    context.Items["User"] =  new UserViewDTO { Email = emailClaim, Id = userId };
                }
            }
            catch
            {
                // Invalid token: leave context unauthenticated
            }
        }

        await _next(context);
    }
}