<?php

namespace App\Http\Controllers;

use App\Actions\Sales\CancelSaleAction;
use App\Actions\Sales\CreateSaleAction;
use App\Actions\Sales\UpdateSalePaymentAction;
use App\Enums\SaleStatus;
use App\Http\Requests\Sales\StoreSaleRequest;
use App\Models\Sale;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request, Workspace $workspace): Response
    {
        $this->authorize('viewAny', [Sale::class, $workspace]);

        $sales = $workspace->sales()
            ->with(['items.product'])
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested
                        ->where('id', $search)
                        ->orWhere('description', 'like', '%'.$search.'%')
                        ->orWhereHas('items.product', fn ($productQuery) => $productQuery->where('name', 'like', '%'.$search.'%'));
                });
            })
            ->when($request->string('status')->toString(), function ($query, string $status): void {
                if (in_array($status, array_column(SaleStatus::cases(), 'value'), true)) {
                    $query->where('status', $status);
                }
            })
            ->when($request->date('from'), fn ($query, $from) => $query->whereDate('sold_at', '>=', $from))
            ->when($request->date('to'), fn ($query, $to) => $query->whereDate('sold_at', '<=', $to))
            ->latest('sold_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
                'from' => $request->string('from')->toString(),
                'to' => $request->string('to')->toString(),
            ],
            'canCreate' => $request->user()->can('create', [Sale::class, $workspace]),
        ]);
    }

    public function create(Request $request, Workspace $workspace): Response
    {
        $this->authorize('create', [Sale::class, $workspace]);

        return Inertia::render('sales/create', [
            'products' => $workspace->products()->active()->orderBy('name')->get(['id', 'name', 'price']),
        ]);
    }

    public function store(
        StoreSaleRequest $request,
        Workspace $workspace,
        CreateSaleAction $createSale,
    ): RedirectResponse {
        $sale = $createSale->handle($workspace, $request->saleData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Venda registrada com sucesso.',
        ]);

        return to_route('workspace.sales.show', [$workspace, $sale]);
    }

    public function show(Request $request, Workspace $workspace, Sale $sale): Response
    {
        abort_unless($sale->workspace_id === $workspace->id, 404);

        $this->authorize('view', $sale);

        $sale->load('items.product');

        return Inertia::render('sales/show', [
            'sale' => $sale,
            'canUpdatePayment' => $request->user()->can('updatePayment', $sale),
            'canCancel' => $request->user()->can('cancel', $sale),
        ]);
    }

    public function markPaid(Request $request, Workspace $workspace, Sale $sale, UpdateSalePaymentAction $updatePayment): RedirectResponse
    {
        abort_unless($sale->workspace_id === $workspace->id, 404);

        $this->authorize('updatePayment', $sale);

        $updatePayment->handle($sale);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Venda marcada como paga.',
        ]);

        return back();
    }

    public function cancel(Request $request, Workspace $workspace, Sale $sale, CancelSaleAction $cancelSale): RedirectResponse
    {
        abort_unless($sale->workspace_id === $workspace->id, 404);

        $this->authorize('cancel', $sale);

        $cancelSale->handle($sale);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Venda cancelada.',
        ]);

        return back();
    }
}
