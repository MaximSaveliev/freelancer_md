using BLL.Exceptions;
using BLL.Interfaces;
using BLL.Settings;
using DAL.Interfaces;

namespace BLL.Services;

public sealed class EmailConfirmationService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailSender _emailSender;
    private readonly HostSettings _hostSettings;

    public EmailConfirmationService(IUserRepository userRepository, IEmailSender emailSender, HostSettings hostSettings)
    {
        _userRepository = userRepository;
        _emailSender = emailSender;
        _hostSettings = hostSettings;
    }

    public async Task ConfirmEmail(string email, string token)
    {
        var user = await _userRepository.GetByEmail(email);
        if (user is null)
            throw new InvalidEmailConfirmationException("User not found.");

        if (user.EmailConfirmed)
            return;

        if (string.IsNullOrWhiteSpace(user.EmailConfirmationToken) || user.EmailConfirmationTokenExpiresAt is null)
            throw new InvalidEmailConfirmationException("No confirmation token exists.");

        if (!string.Equals(user.EmailConfirmationToken, token, StringComparison.Ordinal))
            throw new InvalidEmailConfirmationException("Invalid confirmation token.");

        if (user.EmailConfirmationTokenExpiresAt.Value <= DateTime.UtcNow)
            throw new InvalidEmailConfirmationException("Confirmation token expired.");

        user.EmailConfirmed = true;
        user.EmailConfirmationToken = null;
        user.EmailConfirmationTokenExpiresAt = null;

        await _userRepository.Update(user);
    }

    public async Task ResendConfirmation(string email)
    {
        var user = await _userRepository.GetByEmail(email);
        if (user is null)
            return; // don't leak existence

        if (user.EmailConfirmed)
            return;

        // If token missing or expired, generate a new token using same logic in AuthService.
        var token = user.EmailConfirmationToken;
        if (string.IsNullOrWhiteSpace(token) || user.EmailConfirmationTokenExpiresAt is null || user.EmailConfirmationTokenExpiresAt <= DateTime.UtcNow)
        {
            var tokenBytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(32);
            token = Convert.ToBase64String(tokenBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            user.EmailConfirmationToken = token;
            user.EmailConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(24);
            await _userRepository.Update(user);
        }

        var baseUrl = _hostSettings.HostUrl.Trim().TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
            baseUrl = "http://localhost"; // safe fallback for dev

        var confirmLink =
            $"{baseUrl}/v1/api/auth/confirm-email?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(token)}";

        await _emailSender.SendEmailAsync(
            user.Email,
            "Confirm your email",
            $"<p>Please confirm your email by visiting:</p><p><a href=\"{confirmLink}\">{confirmLink}</a></p>"
        );
    }
}
