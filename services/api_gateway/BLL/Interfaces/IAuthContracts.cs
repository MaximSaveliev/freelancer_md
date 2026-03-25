using BLL.DTOs.User;

namespace BLL.Interfaces;

public interface IAuthContracts
{
        Task<TokensDTO> Login(LoginUserDTO loginUserDto);
        Task<UserViewDTO> Register(CreateUserDto createUserDto);
        Task<TokensDTO> Refresh(string refreshToken);
}