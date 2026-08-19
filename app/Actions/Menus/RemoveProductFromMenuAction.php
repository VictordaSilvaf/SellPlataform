<?php

namespace App\Actions\Menus;

use App\Models\Menu;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RemoveProductFromMenuAction
{
    public function handle(Menu $menu, Product $product): void
    {
        $deleted = $menu->menuProducts()->where('product_id', $product->id)->delete();

        if ($deleted === 0) {
            throw (new ModelNotFoundException)->setModel(Product::class, [$product->id]);
        }
    }
}
