<?php

namespace App\Actions\Menus;

use App\Models\Menu;
use App\Models\Product;

class AddProductsToMenuAction
{
    /**
     * @param  list<int>  $productIds
     */
    public function handle(Menu $menu, array $productIds): void
    {
        $existingIds = $menu->menuProducts()->pluck('product_id');

        $eligibleIds = Product::query()
            ->where('workspace_id', $menu->workspace_id)
            ->whereIn('id', $productIds)
            ->pluck('id')
            ->diff($existingIds)
            ->values();

        $position = (int) $menu->menuProducts()->max('position');

        foreach ($eligibleIds as $productId) {
            $position++;

            $menu->menuProducts()->create([
                'product_id' => $productId,
                'position' => $position,
                'active' => true,
            ]);
        }
    }
}
