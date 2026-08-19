<?php

namespace App\Actions\Menus;

use App\Models\Menu;
use App\Models\Product;

class ToggleMenuProductAction
{
    public function handle(Menu $menu, Product $product, bool $active): void
    {
        $menuProduct = $menu->menuProducts()
            ->where('product_id', $product->id)
            ->firstOrFail();

        $menuProduct->update(['active' => $active]);
    }
}
