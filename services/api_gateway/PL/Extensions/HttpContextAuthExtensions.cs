using BLL.DTOs.User;
using Microsoft.AspNetCore.Http;

namespace PL.Extensions;

public static class HttpContextExtensions
{
    public static UserViewDTO? GetUser(this HttpContext context)
    {
        return context.Items["User"] as UserViewDTO;
    }
}