using BLL.Exceptions;
using BLL.Interfaces;
using DAL.Interfaces;

namespace BLL.Services;

public sealed class EmailConfirmationService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailSender _emailSender;

    public EmailConfirmationService(IUserRepository userRepository, IEmailSender emailSender)
    {
        _userRepository = userRepository;
        _emailSender = emailSender;
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

        // If code missing or expired, generate a new 6-digit numeric confirmation code.
        var token = user.EmailConfirmationToken;
        if (string.IsNullOrWhiteSpace(token) || user.EmailConfirmationTokenExpiresAt is null || user.EmailConfirmationTokenExpiresAt <= DateTime.UtcNow)
        {
            // 6-digit code, padded with leading zeros (e.g., "004271").
            token = Random.Shared.Next(0, 1_000_000).ToString("D6");

            user.EmailConfirmationToken = token;
            user.EmailConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(24);
            await _userRepository.Update(user);
        }

        await _emailSender.SendEmailAsync(
            user.Email,
            "Confirm your email",
            $"<p>Your confirmation code is:</p><h2 style=\"letter-spacing:2px\">{token}</h2><p>This code expires in 24 hours.</p>"
        );
    }
}
