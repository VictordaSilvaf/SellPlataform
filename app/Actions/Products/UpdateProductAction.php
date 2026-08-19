<?php

namespace App\Actions\Products;

use App\Models\Product;

class UpdateProductAction
{
    /**
     * @param  array{name?: string, description?: string|null, price?: int, active?: bool}  $data
     */
    public function handle(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->refresh();
    }
}
