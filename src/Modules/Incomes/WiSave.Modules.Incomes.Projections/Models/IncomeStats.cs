namespace WiSave.Modules.Incomes.Projections.Models;

public sealed record IncomeStats(
    decimal YearRecurringTotal,
    decimal LastMonthRecurringTotal,
    decimal? LastMonthRecurringChangePct,
    decimal ThisMonthRecurringTotal,
    decimal? ThisMonthRecurringChangePct,
    decimal Last3MonthsRecurringAverage
);
