namespace TeamsService.Services.Events
{
    public class TeamCreatedEvent
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string? Logo { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class TeamUpdatedEvent
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string? Logo { get; set; }
        public bool IsActive { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class TeamDeletedEvent
    {
        public int TeamId { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
