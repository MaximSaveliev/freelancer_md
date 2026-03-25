using DAL.Entities;

namespace BLL.DTOs.User;

public class TokensDTO
{
    public string AccessToken { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
}