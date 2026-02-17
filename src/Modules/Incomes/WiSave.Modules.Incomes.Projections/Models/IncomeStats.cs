namespace WiSave.Modules.Incomes.Projections.Models;

public sealed record IncomeStats(
    decimal LastYearTotal,
    decimal ThisYearTotal,
    decimal ThisMonthTotal,
    decimal Last3MonthsAverage,
    decimal LastYearMonthlyAverage
);
