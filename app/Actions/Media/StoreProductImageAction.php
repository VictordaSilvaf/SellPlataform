<?php

namespace App\Actions\Media;

use App\Models\Product;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;
use Illuminate\Http\UploadedFile;

class StoreProductImageAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(Product $product, UploadedFile $file): Product
    {
        $path = $this->images->store($file, ImageVariant::ProductMain, $product->id);

        $product->update([
            'image_path' => $path,
            'image_version' => $product->image_version + 1,
        ]);

        return $product->refresh();
    }
}
