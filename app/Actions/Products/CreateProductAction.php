<?php

namespace App\Actions\Products;

use App\Actions\Media\StoreProductImageAction;
use App\Models\Product;
use App\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class CreateProductAction
{
    public function __construct(private StoreProductImageAction $storeImage) {}

    /**
     * @param  array{name: string, description?: string|null, price: int, active?: bool}  $data
     */
    public function handle(Workspace $workspace, array $data, ?UploadedFile $image = null): Product
    {
        return DB::transaction(function () use ($workspace, $data, $image): Product {
            $product = $workspace->products()->create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'price' => $data['price'],
                'active' => $data['active'] ?? true,
            ]);

            if ($image !== null) {
                $this->storeImage->handle($product, $image);
            }

            return $product->refresh();
        });
    }
}
