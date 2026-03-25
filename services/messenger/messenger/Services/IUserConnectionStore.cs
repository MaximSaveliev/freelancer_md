namespace messenger.Services;

public interface IUserConnectionStore
{
    void Add(string connectionId, int userId);
    bool TryGetUserId(string connectionId, out int userId);

    IReadOnlyCollection<string> GetConnections(int userId);

    void Remove(string connectionId);
}
