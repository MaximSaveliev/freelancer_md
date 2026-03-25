using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using System.Text;
using messenger.Settings;

namespace messenger.Services;

public interface IRabbitMqPublisher
{
    Task PublishAsync(string queueName, string message, CancellationToken cancellationToken = default);
}

public sealed class RabbitMqPublisher : IRabbitMqPublisher, IAsyncDisposable
{
    private readonly RabbitMqSettings _settings;
    private readonly ConnectionFactory _factory;
    private IConnection? _connection;
    private readonly SemaphoreSlim _connectionLock = new(1, 1);

    public RabbitMqPublisher(IOptions<RabbitMqSettings> options)
    {
        _settings = options.Value;

        _factory = new ConnectionFactory
        {
            HostName = _settings.HostName,
            Port = _settings.Port,
            UserName = _settings.UserName,
            Password = _settings.Password,
            VirtualHost = _settings.VirtualHost
        };
    }

    public async Task PublishAsync(string queueName, string message, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(queueName))
            throw new ArgumentException("Queue name is required.", nameof(queueName));

        await EnsureConnectionAsync(cancellationToken);

        await using var channel = await _connection!.CreateChannelAsync(new CreateChannelOptions(
            false,
            false,
            null,
            null));

        await channel.QueueDeclareAsync(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        var props = new BasicProperties { DeliveryMode = DeliveryModes.Persistent };
        var body = Encoding.UTF8.GetBytes(message);

        await channel.BasicPublishAsync(
            exchange: _settings.Exchange,
            routingKey: queueName,
            mandatory: false,
            basicProperties: props,
            body: body,
            cancellationToken: cancellationToken);
    }

    private async Task EnsureConnectionAsync(CancellationToken cancellationToken)
    {
        if (_connection is not null)
            return;

        await _connectionLock.WaitAsync(cancellationToken);
        try
        {
            if (_connection is null)
                _connection = await _factory.CreateConnectionAsync(cancellationToken);
        }
        finally
        {
            _connectionLock.Release();
        }
    }

    public async ValueTask DisposeAsync()
    {
        _connectionLock.Dispose();

        if (_connection is not null)
            await _connection.DisposeAsync();
    }
}
