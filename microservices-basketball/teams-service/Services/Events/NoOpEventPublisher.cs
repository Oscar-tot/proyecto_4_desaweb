namespace TeamsService.Services.Events
{
    /// <summary>
    /// Implementación sin operaciones del IEventPublisher
    /// Útil para desarrollo cuando no se quiere usar RabbitMQ
    /// </summary>
    public class NoOpEventPublisher : IEventPublisher
    {
        private readonly ILogger<NoOpEventPublisher> _logger;

        public NoOpEventPublisher(ILogger<NoOpEventPublisher> logger)
        {
            _logger = logger;
        }

        public Task PublishTeamCreatedAsync(TeamCreatedEvent eventData)
        {
            _logger.LogInformation("(NoOp) Team Created Event: {TeamId} - {TeamName}", 
                eventData.TeamId, eventData.TeamName);
            return Task.CompletedTask;
        }

        public Task PublishTeamUpdatedAsync(TeamUpdatedEvent eventData)
        {
            _logger.LogInformation("(NoOp) Team Updated Event: {TeamId} - {TeamName}", 
                eventData.TeamId, eventData.TeamName);
            return Task.CompletedTask;
        }

        public Task PublishTeamDeletedAsync(TeamDeletedEvent eventData)
        {
            _logger.LogInformation("(NoOp) Team Deleted Event: {TeamId}", 
                eventData.TeamId);
            return Task.CompletedTask;
        }
    }
}
