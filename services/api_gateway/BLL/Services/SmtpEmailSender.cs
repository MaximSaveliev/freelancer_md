using System.Net;
using System.Net.Mail;
using BLL.Interfaces;
using BLL.Settings;

namespace BLL.Services;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly EmailSettings _settings;

    public SmtpEmailSender(EmailSettings settings)
    {
        _settings = settings;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        Console.WriteLine(_settings.UseConsoleSink);
        Console.WriteLine(_settings.SmtpHost);
        Console.WriteLine(_settings.FromName);
        
        if (_settings.UseConsoleSink)
        {
            Console.WriteLine("--- EMAIL (console sink) ---");
            Console.WriteLine($"To: {toEmail}");
            Console.WriteLine($"Subject: {subject}");
            Console.WriteLine(htmlBody);
            Console.WriteLine("--------------------------");
            return;
        }

        if (string.IsNullOrWhiteSpace(_settings.SmtpHost))
            throw new InvalidOperationException("EmailSettings.SmtpHost is not configured.");

        using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
        {
            EnableSsl = true
        };

        if (!string.IsNullOrWhiteSpace(_settings.SmtpUser))
        {
            client.Credentials = new NetworkCredential(_settings.SmtpUser, _settings.SmtpPassword);
        }

        using var msg = new MailMessage
        {
            From = new MailAddress(_settings.FromEmail, _settings.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        msg.To.Add(toEmail);

        await client.SendMailAsync(msg);
    }
}

