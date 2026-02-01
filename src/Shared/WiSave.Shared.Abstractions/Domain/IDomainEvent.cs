namespace WiSave.Shared.Abstractions.Domain;

public interface IDomainEvent
{
    Guid Id { get; }
    DateTime OccurredAt { get; }
}
