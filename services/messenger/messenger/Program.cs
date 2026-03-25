using messenger.Settings;
using BLL.Services;
using DAL;
using DAL.Interfaces;
using DAL.Repositories;
using messenger.Hubs;
using messenger.Middlewares;
using messenger.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Load variables from .env in the app folder (dev convenience)
DotNetEnv.Env.Load();
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddControllers();

// CORS (dev-friendly)
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
        policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

builder.Services.AddSingleton<IUserConnectionStore, InMemoryUserConnectionStore>();

builder.Services.AddDbContext<MessengerDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<RabbitMqSettings>(builder.Configuration.GetSection("RabbitMq"));

// Ensure TokenValidationMiddleware can resolve JwtSettings directly.
builder.Services.AddSingleton(sp => sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<JwtSettings>>().Value);

// DAL repositories
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();

// BLL services
builder.Services.AddScoped<IConversationService, ConversationService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddSingleton<IRabbitMqPublisher, RabbitMqPublisher>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("DevCors");
app.UseWebSockets();

// Run token validation ONLY for API/controller routes (skip SignalR hubs).
app.UseWhen(
    context => !context.Request.Path.StartsWithSegments("/hubs"),
    branch => { branch.UseTokenValidation(); }
);

app.MapControllers();

app.MapHub<ChatHub>("/hubs/chat");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MessengerDbContext>();
    db.Database.Migrate();
}

app.Run();

