<?php

namespace App\Actions\Sales;

use App\Enums\SaleStatus;
use App\Models\Sale;
use Illuminate\Validation\ValidationException;

class CancelSaleAction
{
    public function handle(Sale $sale): Sale
    {
        if ($sale->status === SaleStatus::Cancelled) {
            throw ValidationException::withMessages([
                'status' => 'Esta venda já está cancelada.',
            ]);
        }

        $sale->update([
            'status' => SaleStatus::Cancelled,
        ]);

        return $sale->refresh();
    }
}
