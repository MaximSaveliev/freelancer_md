using DAL.Models;

namespace DAL.Interfaces;

public interface IUserRepository
{
    Task<bool> ExistsAsync(int userId, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<User> AddAsync(User user, CancellationToken cancellationToken = default);
}
