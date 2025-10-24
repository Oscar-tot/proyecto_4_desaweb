using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace TeamsService.Services.Events
{
    public class RabbitMQEventPublisher : IEventPublisher, IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly ILogger<RabbitMQEventPublisher> _logger;
        private const string ExchangeName = "teams-events";

        public RabbitMQEventPublisher(IConfiguration configuration, ILogger<RabbitMQEventPublisher> logger)
        {
            _logger = logger;

            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = configuration["RabbitMQ:Host"] ?? "localhost",
                    Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672"),
                    UserName = configuration["RabbitMQ:Username"] ?? "guest",
                    Password = configuration["RabbitMQ:Password"] ?? "guest"
                };

                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                // Declarar exchange tipo fanout para broadcasting
                _channel.ExchangeDeclare(
                    exchange: ExchangeName,
                    type: ExchangeType.Fanout,
                    durable: true,
                    autoDelete: false
                );

                _logger.LogInformation("Conectado a RabbitMQ en {Host}:{Port}", factory.HostName, factory.Port);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al conectar con RabbitMQ");
                throw;
            }
        }

        public async Task PublishTeamCreatedAsync(TeamCreatedEvent eventData)
        {
            await PublishEventAsync("team.created", eventData);
        }

        public async Task PublishTeamUpdatedAsync(TeamUpdatedEvent eventData)
        {
            await PublishEventAsync("team.updated", eventData);
        }

        public async Task PublishTeamDeletedAsync(TeamDeletedEvent eventData)
        {
            await PublishEventAsync("team.deleted", eventData);
        }

        private Task PublishEventAsync<T>(string routingKey, T eventData)
        {
            try
            {
                var message = JsonSerializer.Serialize(eventData);
                var body = Encoding.UTF8.GetBytes(message);

                var properties = _channel.CreateBasicProperties();
                properties.Persistent = true;
                properties.ContentType = "application/json";
                properties.Type = routingKey;
                properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

                _channel.BasicPublish(
                    exchange: ExchangeName,
                    routingKey: routingKey,
                    basicProperties: properties,
                    body: body
                );

                _logger.LogInformation("Evento publicado: {RoutingKey} - {Message}", routingKey, message);
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al publicar evento {RoutingKey}", routingKey);
                // No lanzamos excepción para no afectar el flujo principal
                return Task.CompletedTask;
            }
        }

        public void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
            _logger.LogInformation("Conexión a RabbitMQ cerrada");
        }
    }
}
