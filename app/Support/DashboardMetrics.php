<?php

namespace App\Support;

use App\Enums\SaleStatus;
use App\Models\Sale;
use App\Models\Workspace;
use Illuminate\Support\Collection;

class DashboardMetrics
{
    /**
     * @return array{
     *     today_total: int,
     *     month_total: int,
     *     received_total: int,
     *     pending_total: int,
     *     sales_count: int,
     *     chart: list<array{date: string, label: string, total: int}>,
     *     recent_sales: Collection<int, Sale>
     * }
     */
    public function for(Workspace $workspace, string $period = '7'): array
    {
        $sales = Sale::query()->where('workspace_id', $workspace->id);

        $todayTotal = (clone $sales)
            ->notCancelled()
            ->whereDate('sold_at', today())
            ->sum('total');

        $monthTotal = (clone $sales)
            ->notCancelled()
            ->whereBetween('sold_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total');

        $receivedTotal = (clone $sales)
            ->where('status', SaleStatus::Paid)
            ->sum('total');

        $pendingTotal = (clone $sales)
            ->where('status', SaleStatus::Pending)
            ->sum('total');

        $salesCount = (clone $sales)->notCancelled()->count();

        $days = $this->periodDays($period);
        $from = now()->subDays($days - 1)->startOfDay();

        $paidByDay = Sale::query()
            ->where('workspace_id', $workspace->id)
            ->where('status', SaleStatus::Paid)
            ->where('sold_at', '>=', $from)
            ->selectRaw('date(sold_at) as day, sum(total) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $chart = [];

        for ($i = 0; $i < $days; $i++) {
            $date = $from->copy()->addDays($i);
            $key = $date->toDateString();

            $chart[] = [
                'date' => $key,
                'label' => $date->format('d/m'),
                'total' => (int) ($paidByDay[$key] ?? 0),
            ];
        }

        $recentSales = Sale::query()
            ->where('workspace_id', $workspace->id)
            ->with(['items.product'])
            ->latest('sold_at')
            ->limit(8)
            ->get();

        return [
            'today_total' => (int) $todayTotal,
            'month_total' => (int) $monthTotal,
            'received_total' => (int) $receivedTotal,
            'pending_total' => (int) $pendingTotal,
            'sales_count' => $salesCount,
            'chart' => $chart,
            'recent_sales' => $recentSales,
        ];
    }

    private function periodDays(string $period): int
    {
        return match ($period) {
            '30' => 30,
            '90' => 90,
            'year' => (int) now()->startOfYear()->diffInDays(now()) + 1,
            default => 7,
        };
    }
}
