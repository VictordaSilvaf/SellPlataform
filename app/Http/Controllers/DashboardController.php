<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Support\DashboardMetrics;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, Workspace $workspace, DashboardMetrics $metrics): Response
    {
        $period = $request->string('period')->toString() ?: '7';

        $data = $metrics->for($workspace, $period);

        return Inertia::render('dashboard/index', [
            'metrics' => [
                'today_total' => $data['today_total'],
                'month_total' => $data['month_total'],
                'received_total' => $data['received_total'],
                'pending_total' => $data['pending_total'],
                'sales_count' => $data['sales_count'],
            ],
            'chart' => $data['chart'],
            'recentSales' => $data['recent_sales'],
            'period' => $period,
        ]);
    }
}
