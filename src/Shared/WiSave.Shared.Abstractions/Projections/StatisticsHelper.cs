namespace WiSave.Shared.Abstractions.Projections;

public static class StatisticsHelper
{
    public static decimal? CalculateChangePercent(decimal current, decimal previous)
    {
        if (previous == 0)
        {
            return null;
        }

        return (current - previous) / previous * 100m;
    }
}
