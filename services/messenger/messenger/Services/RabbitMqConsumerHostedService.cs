using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using api_gateway.Settings;

namespace messenger.Services;

/// <summary>
/// RabbitMQ consumer hosted service using RabbitMQ.Client v7 async APIs.
/// Owns its channel for the service lifetime.
/// </summary>
public sealed class RabbitMqConsumerHostedService : BackgroundService, IAsyncDisposable
{
    private readonly RabbitMqSettings _settings;
    private readonly ILogger<RabbitMqConsumerHostedService> _logger;

    private readonly ConnectionFactory _factory;
    private IConnection? _connection;
    private IChannel? _channel;

    // For now, consume from a single queue. Extend to multiple if needed.
    private const string QueueName = "UserCreatedQueue";

    public RabbitMqConsumerHostedService(IOptions<RabbitMqSettings> options, ILogger<RabbitMqConsumerHostedService> logger)
    {
        _settings = options.Value;
        _logger = logger;

        _factory = new ConnectionFactory
        {
            HostName = _settings.HostName,
            Port = _settings.Port,
            UserName = _settings.UserName,
            Password = _settings.Password,
            VirtualHost = _settings.VirtualHost
        };
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Connect and set up topology once.
        _connection = await _factory.CreateConnectionAsync(stoppingToken);
        _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);

        await _channel.QueueDeclareAsync(
            queue: QueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: stoppingToken);

        // Avoid flooding the service.
        await _channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 10, global: false, cancellationToken: stoppingToken);

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.ReceivedAsync += async (sender, ea) =>
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                _logger.LogInformation("RabbitMQ message received on {Queue}: {Message}", QueueName, message);

                // TODO: handle message (call app services etc)

                await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false, cancellationToken: stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing RabbitMQ message. Nacking.");

                // Requeue=true for transient errors; set false if you use DLQ.
                if (_channel is not null)
                    await _channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: true, cancellationToken: stoppingToken);
            }
        };

        // Start consuming. Keep the task alive until cancellation.
        await _channel.BasicConsumeAsync(
            queue: QueueName,
            autoAck: false,
            consumer: consumer,
            cancellationToken: stoppingToken);

        // Wait until service is stopped.
        try
        {
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            // expected
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel is not null)
            await _channel.DisposeAsync();
        if (_connection is not null)
            await _connection.DisposeAsync();
    }
}

