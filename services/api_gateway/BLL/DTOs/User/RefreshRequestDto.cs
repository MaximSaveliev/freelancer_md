namespace BLL.DTOs.User;

public sealed class RefreshRequestDto
{
    /// <summary>
    /// Optional: if not provided, controller will try to read refresh token from cookie "refreshToken".
    /// </summary>
    public string? RefreshToken { get; set; }
}

