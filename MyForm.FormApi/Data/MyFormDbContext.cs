using Microsoft.EntityFrameworkCore;
using MyForm.FormApi.Entities;

namespace MyForm.FormApi.Data;



public class MyFormDbContext(DbContextOptions<MyFormDbContext> options) : DbContext(options)
{
    public DbSet<SimpleForm> Forms { get; set; }
}