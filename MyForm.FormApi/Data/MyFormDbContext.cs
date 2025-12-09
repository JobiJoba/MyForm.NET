using Microsoft.EntityFrameworkCore;
using MyForm.FormApi.Data.Configurations;
using MyForm.FormApi.Entities;

namespace MyForm.FormApi.Data;

public class MyFormDbContext(DbContextOptions<MyFormDbContext> options) : DbContext(options)
{
    public DbSet<SimpleForm> Forms { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply entity configurations
        modelBuilder.ApplyConfiguration(new SimpleFormConfiguration());
    }
}