using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyForm.FormApi.Entities;

namespace MyForm.FormApi.Data.Configurations;

public class SimpleFormConfiguration : IEntityTypeConfiguration<SimpleForm>
{
    public void Configure(EntityTypeBuilder<SimpleForm> builder)
    {
        builder.ToTable("Forms");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Id)
            .ValueGeneratedOnAdd();

        builder.Property(f => f.FirstName)
            .IsRequired()
            .HasMaxLength(100)
            .HasComment("The first name of the form submitter");

        builder.Property(f => f.LastName)
            .IsRequired()
            .HasMaxLength(100)
            .HasComment("The last name of the form submitter");

        builder.Property(f => f.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .HasComment("Timestamp when the form was created");

        // Index for common queries
        builder.HasIndex(f => f.CreatedAt)
            .HasDatabaseName("IX_Forms_CreatedAt");

        // Composite index for name searches
        builder.HasIndex(f => new { f.FirstName, f.LastName })
            .HasDatabaseName("IX_Forms_FirstName_LastName");
    }
}

