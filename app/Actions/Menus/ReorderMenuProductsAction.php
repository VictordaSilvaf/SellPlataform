<?php

namespace App\Actions\Menus;

use App\Models\Menu;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReorderMenuProductsAction
{
    /**
     * @param  list<int>  $productIds
     */
    public function handle(Menu $menu, array $productIds): void
    {
        DB::transaction(function () use ($menu, $productIds): void {
            $existingIds = $menu->menuProducts()
                ->lockForUpdate()
                ->pluck('product_id')
                ->sort()
                ->values();

            $incomingIds = collect($productIds)->sort()->values();

            if ($existingIds->all() !== $incomingIds->all()) {
                throw ValidationException::withMessages([
                    'product_ids' => 'A ordem deve incluir todos os produtos do cardápio.',
                ]);
            }

            foreach (array_values($productIds) as $index => $productId) {
                $menu->menuProducts()
                    ->where('product_id', $productId)
                    ->update(['position' => $index + 1]);
            }
        });
    }
}
