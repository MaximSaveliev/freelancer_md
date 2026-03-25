using BLL.DTOs.User;

namespace BLL.Interfaces;

public interface ITokenService
{ 
    string GenerateAccessToken(UserViewDTO user);
    string GenerateRefreshToken();
}