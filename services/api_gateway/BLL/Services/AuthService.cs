using System.Security.Cryptography;
using BLL.DTOs.User;
using BLL.Exceptions;
using BLL.Interfaces;
using DAL.Entities;
using DAL.Interfaces;

namespace BLL.Services;

public class AuthService : IAuthContracts
{
    private readonly int _iterations = 100_000;
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IEmailSender _emailSender;
    
    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        IRefreshTokenRepository refreshTokenRepository,
        IEmailSender emailSender
        )
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _tokenService = tokenService;
        _emailSender = emailSender; // kept for DI; email is sent via resend-email-confirmation
    }

    public async Task<TokensDTO> Login(LoginUserDTO loginUserDto)
    {
        User? existingUser = await _userRepository.GetByEmail(loginUserDto.Email);

        if (existingUser is null)
            throw new BadCredentialsException("Invalid email or password.");

        if (!existingUser.EmailConfirmed)
            throw new EmailNotConfirmedException("Please confirm your email before logging in.");

        using var pbkdf2 = new Rfc2898DeriveBytes(loginUserDto.Password, Convert.FromBase64String(existingUser.Salt), _iterations,
            HashAlgorithmName.SHA256);

        if (existingUser.PasswordHash != Convert.ToBase64String(pbkdf2.GetBytes(32)))
                throw new BadCredentialsException("Invalid email or password.");
        
        string accessToken = _tokenService.GenerateAccessToken(new UserViewDTO() { Id = existingUser.Id, Email = existingUser.Email });
        string refreshToken = _tokenService.GenerateRefreshToken();

        try
        {
            await _refreshTokenRepository.Create(new RefreshToken()
            {
                UserId = existingUser.Id,
                Value = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            });
        }
        catch (Exception e)
        {
            throw new Exception("An error occurred while saving the refresh token.", e);
        }

        return new TokensDTO
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }
    
    public async Task<UserViewDTO> Register(CreateUserDto createUserDto)
    {
        User? existingUser = await _userRepository.GetByEmail(createUserDto.Email);
        
        if (existingUser is not null)
            throw new UserAlreadyExistsException("User with this email already exists.");

        // Generate salt and hash password
        var salt = RandomNumberGenerator.GetBytes(16);
        using var pbkdf2 = new Rfc2898DeriveBytes(createUserDto.Password, salt, _iterations, HashAlgorithmName.SHA256);
    
        var newUser = new User
        {
            Email = createUserDto.Email,
            PasswordHash = Convert.ToBase64String(pbkdf2.GetBytes(32)),
            Salt = Convert.ToBase64String(salt)
        };

        try
        {
            var createdUser = await _userRepository.Create(newUser);

            // Pre-generate the confirmation token so resend-email-confirmation can send it immediately.
            var token = Random.Shared.Next(0, 1_000_000).ToString("D6");
            createdUser.EmailConfirmationToken = token;
            createdUser.EmailConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(24);
            createdUser.EmailConfirmed = false;

            await _userRepository.Update(createdUser);

            // Email is sent by the frontend via POST /resend-email-confirmation (called right after this).
            return new UserViewDTO
            {
                Id = createdUser.Id,
                Email = createdUser.Email
            };
        }
        catch (Exception ex)
        {
            throw new Exception("An error occurred while creating the user.", ex);
        }
    }

    public async Task<TokensDTO> Refresh(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            throw new InvalidRefreshTokenException("Refresh token is missing.");

        var existing = await _refreshTokenRepository.GetByValue(refreshToken);

        if (existing is null)
            throw new InvalidRefreshTokenException("Refresh token is invalid.");

        if (existing.RevokedAt is not null)
            throw new InvalidRefreshTokenException("Refresh token was revoked.");

        if (existing.ExpiresAt <= DateTime.UtcNow)
            throw new InvalidRefreshTokenException("Refresh token has expired.");

        // Revoke old token (rotation)
        existing.RevokedAt = DateTime.UtcNow;
        await _refreshTokenRepository.Update(existing);

        // GetByValue() includes User, but keep a defensive fallback.
        var user = existing.User;
        if (user is null)
            user = await _userRepository.GetById(existing.UserId);

        if (user is null)
            throw new InvalidRefreshTokenException("User not found for this refresh token.");

        var newAccessToken = _tokenService.GenerateAccessToken(new UserViewDTO { Id = user.Id, Email = user.Email });
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        await _refreshTokenRepository.Create(new RefreshToken
        {
            UserId = user.Id,
            Value = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });

        return new TokensDTO
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };
    }
}