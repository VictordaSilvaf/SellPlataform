<?php

namespace App\Http\Controllers;

use App\Actions\Products\CreateProductAction;
use App\Actions\Products\UpdateProductAction;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Models\Product;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request, Workspace $workspace): Response
    {
        $this->authorize('viewAny', [Product::class, $workspace]);

        $products = $workspace->products()
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where('name', 'like', '%'.$search.'%');
            })
            ->when($request->string('status')->toString(), function ($query, string $status): void {
                if ($status === 'active') {
                    $query->where('active', true);
                }

                if ($status === 'inactive') {
                    $query->where('active', false);
                }
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'canManage' => $request->user()->can('create', [Product::class, $workspace]),
        ]);
    }

    public function create(Request $request, Workspace $workspace): Response
    {
        $this->authorize('create', [Product::class, $workspace]);

        return Inertia::render('products/create');
    }

    public function store(
        StoreProductRequest $request,
        Workspace $workspace,
        CreateProductAction $createProduct,
    ): RedirectResponse {
        $createProduct->handle($workspace, $request->productData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Produto criado com sucesso.',
        ]);

        return to_route('workspace.products.index', $workspace);
    }

    public function edit(Request $request, Workspace $workspace, Product $product): Response
    {
        abort_unless($product->workspace_id === $workspace->id, 404);

        $this->authorize('update', $product);

        return Inertia::render('products/edit', [
            'product' => $product,
        ]);
    }

    public function update(
        UpdateProductRequest $request,
        Workspace $workspace,
        Product $product,
        UpdateProductAction $updateProduct,
    ): RedirectResponse {
        abort_unless($product->workspace_id === $workspace->id, 404);

        $updateProduct->handle($product, $request->productData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Produto atualizado com sucesso.',
        ]);

        return to_route('workspace.products.index', $workspace);
    }

    public function toggle(Request $request, Workspace $workspace, Product $product): RedirectResponse
    {
        abort_unless($product->workspace_id === $workspace->id, 404);

        $this->authorize('update', $product);

        $product->update(['active' => ! $product->active]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $product->active ? 'Produto ativado.' : 'Produto desativado.',
        ]);

        return back();
    }
}
