using DAL.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAL.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(255);
        builder.Property(u => u.PasswordHash).IsRequired();
        builder.Property(u => u.CreatedAt).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.Salt).IsRequired();

        builder.Property(u => u.EmailConfirmed).IsRequired();
        builder.Property(u => u.EmailConfirmationToken).HasMaxLength(512);
        builder.Property(u => u.EmailConfirmationTokenExpiresAt);
        builder.HasIndex(u => u.EmailConfirmationToken);
    }
}