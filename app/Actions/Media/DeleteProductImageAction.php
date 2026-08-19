<?php

namespace App\Actions\Media;

use App\Models\Product;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;

class DeleteProductImageAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(Product $product): void
    {
        if ($product->image_path === null) {
            return;
        }

        $this->images->delete(ImageVariant::ProductMain, $product->id);

        $product->update([
            'image_path' => null,
            'image_version' => 0,
        ]);
    }
}
