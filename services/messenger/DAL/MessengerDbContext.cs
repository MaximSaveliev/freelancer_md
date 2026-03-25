using DAL.Configurations;
using DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace DAL;

public class MessengerDbContext : DbContext
{
    public MessengerDbContext(DbContextOptions<MessengerDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new ConversationConfiguration());
        modelBuilder.ApplyConfiguration(new MessageConfiguration());
    }
}

