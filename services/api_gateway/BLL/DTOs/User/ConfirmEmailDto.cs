namespace BLL.DTOs.User;

public sealed class ConfirmEmailDto
{
    public string Email { get; set; } = null!;
    public string Token { get; set; } = null!;
}

