using DAL.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAL.Configurations;

public sealed class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.HasIndex(c => new { c.User1Id, c.User2Id })
            .IsUnique();

        builder.HasOne(c => c.User1)
            .WithMany(u => u.ConversationsAsUser1)
            .HasForeignKey(c => c.User1Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.User2)
            .WithMany(u => u.ConversationsAsUser2)
            .HasForeignKey(c => c.User2Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Messages)
            .WithOne(m => m.Conversation)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Last-seen message pointers (optional relationships)
        builder.Property(c => c.User1LastSeenMessageId)
            .IsRequired(false);

        builder.Property(c => c.User2LastSeenMessageId)
            .IsRequired(false);

        builder.HasOne(c => c.User1LastSeenMessage)
            .WithMany()
            .HasForeignKey(c => c.User1LastSeenMessageId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.User2LastSeenMessage)
            .WithMany()
            .HasForeignKey(c => c.User2LastSeenMessageId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
