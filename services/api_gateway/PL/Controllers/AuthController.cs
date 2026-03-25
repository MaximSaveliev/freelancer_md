using BLL.DTOs.User;
using BLL.Exceptions;
using BLL.Interfaces;
using BLL.Services;
using BLL.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PL.Controllers;

[Route("v1/api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthContracts _authContracts;
    private readonly JwtSettings _jwtSettings;
    private readonly EmailConfirmationService _emailConfirmationService;
    
    public AuthController(
        IAuthContracts authContracts,
        JwtSettings jwtSettings,
        EmailConfirmationService emailConfirmationService)
    {
        _authContracts = authContracts;
        _jwtSettings = jwtSettings;
        _emailConfirmationService = emailConfirmationService;
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserDTO loginUserDto)
    {
        try
        {
            TokensDTO tokens = await _authContracts.Login(loginUserDto);
            
            // Set Access Token cookie
            Response.Cookies.Append("accessToken", tokens.AccessToken, new CookieOptions
            {
                HttpOnly = false,    
                Secure = true,         // only HTTPS
                SameSite = SameSiteMode.Strict, 
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes) // match token expiry
            });

            // Set Refresh Token cookie
            Response.Cookies.Append("refreshToken", tokens.RefreshToken, new CookieOptions()
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays) // match refresh token expiry
            });
            
            return Ok(tokens);
        }
        catch (BadCredentialsException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception e)
        {
            // You can log the exception here
            // _logger.LogError(e, "Error during login");

            return StatusCode(500, e.Message);
        }
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            UserViewDTO user = await _authContracts.Register(createUserDto);
            return Ok(user);
        }
        catch (UserAlreadyExistsException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception e)
        {
            // You can log the exception here
            // _logger.LogError(e, "Error during registration");

            return StatusCode(500, "An unexpected error occurred.");
        }
    }
    
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto? dto = null)
    {
        var refreshToken = dto?.RefreshToken;

        try
        {
            var tokens = await _authContracts.Refresh(refreshToken ?? string.Empty);

            // Update cookies (rotate)
            Response.Cookies.Append("accessToken", tokens.AccessToken, new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes)
            });

            Response.Cookies.Append("refreshToken", tokens.RefreshToken, new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
            });

            return Ok(tokens);
        }
        catch (InvalidRefreshTokenException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
    {
        try
        {
            await _emailConfirmationService.ConfirmEmail(dto.Email, dto.Token);
            return Ok(new { message = "Email confirmed" });
        }
        catch (InvalidEmailConfirmationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("resend-email-confirmation")]
    public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationDto dto)
    {
        await _emailConfirmationService.ResendConfirmation(dto.Email);
        return Ok(new { message = "If the email exists and is not confirmed, a confirmation was sent." });
    }
}