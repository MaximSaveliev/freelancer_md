using BLL.Interfaces;
using BLL.Services;
using BLL.Settings;
using DAL.DbContexts;
using DAL.Interfaces;
using DAL.Reposirories;
using Microsoft.EntityFrameworkCore;
using PL.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Load .env for local development.
DotNetEnv.Env.Load();

// Rebuild configuration after loading .env so values are present in builder.Configuration.
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Bind settings from configuration (appsettings + env vars)
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.Configure<HostSettings>(builder.Configuration.GetSection("HostSettings"));

// Keep current injected concrete settings pattern too
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? new JwtSettings();
var emailSettings = builder.Configuration.GetSection("EmailSettings").Get<EmailSettings>() ?? new EmailSettings();
var hostSettings = builder.Configuration.GetSection("HostSettings").Get<HostSettings>() ?? new HostSettings();

builder.Services.AddSingleton(jwtSettings);
builder.Services.AddSingleton(emailSettings);
builder.Services.AddSingleton(hostSettings);

builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthContracts, AuthService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<EmailConfirmationService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseTokenValidation();
app.MapControllers();

app.Run();

