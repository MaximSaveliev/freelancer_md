using DAL.DbContexts;
using DAL.Entities;
using DAL.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DAL.Reposirories;

public class RefreshTokenRepository: IRefreshTokenRepository
{
    private readonly AppDbContext _context;
    
    public RefreshTokenRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<RefreshToken?> GetById(int id)
    {
       return await _context.RefreshTokens.FindAsync(id);
    }

    public async Task<IEnumerable<RefreshToken>> GetAll()
    {
        return await _context.RefreshTokens.ToListAsync();
    }

    public async Task<RefreshToken> Create(RefreshToken entity)
    {
        _context.RefreshTokens.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task Update(RefreshToken entity)
    {
        _context.RefreshTokens.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task Delete(RefreshToken entity)
    {
        _context.RefreshTokens.Remove(entity);
        await _context.SaveChangesAsync();
    }

    public async Task<RefreshToken?> GetByValue(string value)
    {
        return await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Value == value);
    }
}