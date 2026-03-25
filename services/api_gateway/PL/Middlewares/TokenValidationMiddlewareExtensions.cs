using Microsoft.AspNetCore.Builder;

namespace PL.Middlewares;

public static class TokenValidationMiddlewareExtensions
{
    public static IApplicationBuilder UseTokenValidation(this IApplicationBuilder app)
        => app.UseMiddleware<TokenValidationMiddleware>();
}