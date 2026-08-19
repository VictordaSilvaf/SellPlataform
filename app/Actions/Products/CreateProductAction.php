<?php

namespace App\Actions\Products;

use App\Models\Product;
use App\Models\Workspace;

class CreateProductAction
{
    /**
     * @param  array{name: string, description?: string|null, price: int, active?: bool}  $data
     */
    public function handle(Workspace $workspace, array $data): Product
    {
        return $workspace->products()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'active' => $data['active'] ?? true,
        ]);
    }
}
