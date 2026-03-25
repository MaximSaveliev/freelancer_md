using System;
using System.Collections.Generic;

namespace DAL.Models;

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public ICollection<Conversation> ConversationsAsUser1 { get; set; } = new List<Conversation>();
    public ICollection<Conversation> ConversationsAsUser2 { get; set; } = new List<Conversation>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}

