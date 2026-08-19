<?php

namespace App\Actions\Sales;

use App\Enums\SaleStatus;
use App\Models\Sale;
use Illuminate\Validation\ValidationException;

class UpdateSalePaymentAction
{
    public function handle(Sale $sale): Sale
    {
        if ($sale->status !== SaleStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => 'Somente vendas pendentes podem ser marcadas como pagas.',
            ]);
        }

        $sale->update([
            'status' => SaleStatus::Paid,
        ]);

        return $sale->refresh();
    }
}
