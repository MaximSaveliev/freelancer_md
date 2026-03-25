using System.Collections.Concurrent;

namespace messenger.Services;

public sealed class InMemoryUserConnectionStore : IUserConnectionStore
{
    private readonly ConcurrentDictionary<string, int> _connectionToUser = new();
    private readonly ConcurrentDictionary<int, ConcurrentDictionary<string, byte>> _userToConnections = new();

    public void Add(string connectionId, int userId)
    {
        _connectionToUser[connectionId] = userId;

        var set = _userToConnections.GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());
        set[connectionId] = 0;
    }

    public bool TryGetUserId(string connectionId, out int userId)
        => _connectionToUser.TryGetValue(connectionId, out userId);

    public IReadOnlyCollection<string> GetConnections(int userId)
    {
        if (_userToConnections.TryGetValue(userId, out var set))
            return set.Keys.ToArray();

        return Array.Empty<string>();
    }

    public void Remove(string connectionId)
    {
        if (!_connectionToUser.TryRemove(connectionId, out var userId))
            return;

        if (_userToConnections.TryGetValue(userId, out var set))
        {
            set.TryRemove(connectionId, out _);
            if (set.IsEmpty)
                _userToConnections.TryRemove(userId, out _);
        }
    }
}
