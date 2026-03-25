using DAL.DbContexts;
using Microsoft.AspNetCore.Mvc;
using PL.Attributes;
using PL.Extensions;

namespace PL.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    
    private readonly AppDbContext _dbContext;
    
    public TestController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Hello from TestController!");
    }
    
    [HttpGet("db")]
    public IActionResult TestDatabase()
    {
        _dbContext.Database.CanConnect();
        return Ok("Database connection successful!");
    }
    
    [HttpGet("test-user")]
    [RequireAuthentication]
    public IActionResult TestUser()
    {
        var user = HttpContext.GetUser();
        
        Console.WriteLine(user.Email);

        return Ok(user);
    }
}