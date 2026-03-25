namespace DAL.Entities;

public class AccessToken
{
    public int Id { get; set; }
    public string Value { get; set; } = null!;
    public DateTime Expiration { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}