namespace WiSave.Modules.Incomes.Projections.Models;

public sealed record MonthlyIncomeStats(
    int Year,
    int Month,
    decimal RecurringTotal,
    decimal NonRecurringTotal
);
