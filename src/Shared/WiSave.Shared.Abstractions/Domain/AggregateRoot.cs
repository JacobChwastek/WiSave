namespace WiSave.Shared.Abstractions.Domain;

public abstract class AggregateRoot
{
    public Guid Id { get; protected set; }
    public int Version { get; protected set; } = -1;

    private readonly List<IDomainEvent> _uncommittedEvents = [];

    public IReadOnlyList<IDomainEvent> GetUncommittedEvents() => _uncommittedEvents.AsReadOnly();

    public void ClearUncommittedEvents() => _uncommittedEvents.Clear();

    protected void AddEvent(IDomainEvent @event)
    {
        _uncommittedEvents.Add(@event);
        Apply(@event);
        Version++;
    }

    protected abstract void Apply(IDomainEvent @event);
}
