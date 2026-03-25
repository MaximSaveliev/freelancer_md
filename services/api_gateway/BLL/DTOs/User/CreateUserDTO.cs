namespace BLL.DTOs.User;

public class CreateUserDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}