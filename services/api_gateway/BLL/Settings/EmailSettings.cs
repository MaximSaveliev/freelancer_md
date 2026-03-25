namespace BLL.Settings;

public sealed class EmailSettings
{
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUser { get; set; }
    public string? SmtpPassword { get; set; }
    public string FromEmail { get; set; } = "no-reply@example.com";
    public string FromName { get; set; } = "API Gateway";

    /// <summary>
    /// If true, emails won't be sent; they will be logged to console.
    /// </summary>
    public bool UseConsoleSink { get; set; } = false;
}

