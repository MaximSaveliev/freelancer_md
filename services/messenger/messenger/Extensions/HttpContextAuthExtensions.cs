using BLL.DTOs.User;

namespace messenger.Extensions;

public static class HttpContextExtensions
{
    public static UserViewDTO? GetUser(this HttpContext context)
    {
        return context.Items["User"] as UserViewDTO;
    }
}