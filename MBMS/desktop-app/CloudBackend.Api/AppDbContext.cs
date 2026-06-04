using Microsoft.EntityFrameworkCore;
using CloudBackend.Api.Models;

namespace CloudBackend.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // This represents your table in PostgreSQL
    public DbSet<TodoItem> Todos => Set<TodoItem>();
}