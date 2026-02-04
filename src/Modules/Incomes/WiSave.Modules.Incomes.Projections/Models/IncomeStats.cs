namespace WiSave.Modules.Incomes.Projections.Models;

public sealed record IncomeStats(
    decimal yearRecurringTotal,
    decimal lastMonthRecurringTotal,
    decimal? lastMonthRecurringChangePct,
    decimal thisMonthRecurringTotal,
    decimal? thisMonthRecurringChangePct,
    decimal last3MonthsRecurringAverage
);
