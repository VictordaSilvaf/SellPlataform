<?php

namespace App\Http\Controllers;

use App\Actions\Media\DeleteProductImageAction;
use App\Actions\Media\StoreProductImageAction;
use App\Http\Requests\Media\StoreImageRequest;
use App\Models\Product;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProductImageController extends Controller
{
    public function store(
        StoreImageRequest $request,
        Workspace $workspace,
        Product $product,
        StoreProductImageAction $storeImage,
    ): RedirectResponse {
        abort_unless($product->workspace_id === $workspace->id, 404);
        $this->authorize('update', $product);

        $storeImage->handle($product, $request->uploadedImage());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Imagem atualizada.',
        ]);

        return back();
    }

    public function destroy(
        Workspace $workspace,
        Product $product,
        DeleteProductImageAction $deleteImage,
    ): RedirectResponse {
        abort_unless($product->workspace_id === $workspace->id, 404);
        $this->authorize('update', $product);

        $deleteImage->handle($product);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Imagem removida.',
        ]);

        return back();
    }
}
