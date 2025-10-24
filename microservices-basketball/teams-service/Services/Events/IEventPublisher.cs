namespace TeamsService.Services.Events
{
    public interface IEventPublisher
    {
        Task PublishTeamCreatedAsync(TeamCreatedEvent eventData);
        Task PublishTeamUpdatedAsync(TeamUpdatedEvent eventData);
        Task PublishTeamDeletedAsync(TeamDeletedEvent eventData);
    }
}
