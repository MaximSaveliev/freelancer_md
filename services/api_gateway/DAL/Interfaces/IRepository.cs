namespace DAL.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetById(int id);
    Task<IEnumerable<T>> GetAll();
    Task<T> Create(T entity);
    Task Update(T entity);
    Task Delete(T entity);
}