using System;
using System.Collections.Generic;

namespace DAL.Models;

public class Conversation
{
    public int Id { get; set; }
    public int User1Id { get; set; }
    public int User2Id { get; set; }
    public int? User1LastSeenMessageId { get; set; }
    public int? User2LastSeenMessageId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? User1 { get; set; }
    public User? User2 { get; set; }
    public Message? User1LastSeenMessage { get; set; }
    public Message? User2LastSeenMessage { get; set; }
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
