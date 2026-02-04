namespace WiSave.Modules.Incomes.Projections.Models;

public sealed record MonthlyIncomeStats(
    int year,
    int month,
    decimal recurringTotal,
    decimal nonRecurringTotal,
    decimal total
);
