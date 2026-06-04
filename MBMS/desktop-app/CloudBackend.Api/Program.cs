using Microsoft.EntityFrameworkCore;
using CloudBackend.Api.Data;
using CloudBackend.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Register the PostgreSQL database context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Add API documentation tools
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // Exposes the raw API documentation schema
}

app.UseHttpsRedirection();

// 3. Define the REST Endpoints for your Apps to consume
// GET all items
app.MapGet("/api/todos", async (AppDbContext db) => 
    await db.Todos.ToListAsync());

// POST a new item
app.MapPost("/api/todos", async (TodoItem item, AppDbContext db) =>
{
    db.Todos.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/api/todos/{item.Id}", item);
});

app.Run();