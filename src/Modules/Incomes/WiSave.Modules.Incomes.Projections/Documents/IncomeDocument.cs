namespace WiSave.Modules.Incomes.Projections.Documents;

public sealed class IncomeDocument
{
    public required string Id { get; init; }
    public required DateTime Date { get; init; }
    public required string Description { get; init; }
    public required List<string> Categories { get; init; }
    public required decimal Amount { get; init; }
    public required string Currency { get; init; }
    public bool Recurring { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
