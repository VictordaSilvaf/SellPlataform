<?php

namespace App\Http\Controllers;

use App\Actions\Menus\AddProductsToMenuAction;
use App\Actions\Menus\RemoveProductFromMenuAction;
use App\Actions\Menus\ReorderMenuProductsAction;
use App\Actions\Menus\ToggleMenuProductAction;
use App\Http\Requests\Menus\AddMenuProductsRequest;
use App\Http\Requests\Menus\ReorderMenuProductsRequest;
use App\Http\Requests\Menus\ToggleMenuProductRequest;
use App\Models\Menu;
use App\Models\Product;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuProductController extends Controller
{
    public function store(
        AddMenuProductsRequest $request,
        Workspace $workspace,
        Menu $menu,
        AddProductsToMenuAction $addProducts,
    ): RedirectResponse {
        $this->ensureMenuInWorkspace($workspace, $menu);

        $addProducts->handle($menu, $request->productIds(), $request->menuSectionId());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Produtos adicionados ao cardápio.',
        ]);

        return back();
    }

    public function destroy(
        Request $request,
        Workspace $workspace,
        Menu $menu,
        Product $product,
        RemoveProductFromMenuAction $removeProduct,
    ): RedirectResponse {
        $this->ensureMenuInWorkspace($workspace, $menu);
        $this->authorize('removeProduct', $menu);
        abort_unless($product->workspace_id === $workspace->id, 404);

        $removeProduct->handle($menu, $product);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Produto removido do cardápio.',
        ]);

        return back();
    }

    public function toggle(
        ToggleMenuProductRequest $request,
        Workspace $workspace,
        Menu $menu,
        Product $product,
        ToggleMenuProductAction $toggleProduct,
    ): RedirectResponse {
        $this->ensureMenuInWorkspace($workspace, $menu);
        abort_unless($product->workspace_id === $workspace->id, 404);

        $toggleProduct->handle($menu, $product, $request->boolean('active'));

        return back();
    }

    public function order(
        ReorderMenuProductsRequest $request,
        Workspace $workspace,
        Menu $menu,
        ReorderMenuProductsAction $reorderProducts,
    ): RedirectResponse {
        $this->ensureMenuInWorkspace($workspace, $menu);

        $reorderProducts->handle($menu, $request->items());

        return back();
    }

    private function ensureMenuInWorkspace(Workspace $workspace, Menu $menu): void
    {
        abort_unless($menu->workspace_id === $workspace->id, 404);
    }
}
