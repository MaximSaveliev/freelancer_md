using BLL.DTOs.User;
using messenger.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace messenger.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequireAuthenticationAttribute : Attribute, IAsyncAuthorizationFilter
{
    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var http = context.HttpContext;

        UserViewDTO? user = http.GetUser();

        if (user is null)
        {
            context.Result = new UnauthorizedResult();
            return Task.CompletedTask;
        }

        return Task.CompletedTask;
    }
}