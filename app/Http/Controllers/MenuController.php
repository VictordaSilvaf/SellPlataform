<?php

namespace App\Http\Controllers;

use App\Actions\Menus\CreateMenuAction;
use App\Actions\Menus\DeleteMenuAction;
use App\Actions\Menus\UpdateMenuAction;
use App\Enums\MenuStatus;
use App\Http\Requests\Menus\StoreMenuRequest;
use App\Http\Requests\Menus\UpdateMenuRequest;
use App\Models\Menu;
use App\Models\Workspace;
use App\Support\MenuLimitChecker;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(Request $request, Workspace $workspace, MenuLimitChecker $menuLimitChecker): Response
    {
        $this->authorize('viewAny', [Menu::class, $workspace]);

        $menus = $workspace->menus()
            ->withCount('menuProducts')
            ->latest()
            ->get()
            ->map(fn (Menu $menu) => [
                'id' => $menu->id,
                'name' => $menu->name,
                'slug' => $menu->slug,
                'status' => $menu->status->value,
                'products_count' => $menu->menu_products_count,
                'public_url' => route('menus.public', $menu),
            ]);

        return Inertia::render('menus/index', [
            'menus' => $menus,
            'canCreate' => $request->user()->can('create', [Menu::class, $workspace])
                && $menuLimitChecker->allows($workspace),
            'canManage' => $request->user()->can('create', [Menu::class, $workspace]),
            'limitReached' => $request->user()->can('create', [Menu::class, $workspace])
                && ! $menuLimitChecker->allows($workspace),
        ]);
    }

    public function create(Request $request, Workspace $workspace, MenuLimitChecker $menuLimitChecker): Response|RedirectResponse
    {
        $this->authorize('create', [Menu::class, $workspace]);

        if (! $menuLimitChecker->allows($workspace)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Você atingiu o limite de cardápios deste plano.',
            ]);

            return to_route('workspace.menus.index', $workspace);
        }

        return Inertia::render('menus/create');
    }

    public function store(
        StoreMenuRequest $request,
        Workspace $workspace,
        CreateMenuAction $createMenu,
    ): RedirectResponse {
        $menu = $createMenu->handle($workspace, $request->menuData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Cardápio criado com sucesso.',
        ]);

        return to_route('workspace.menus.show', [$workspace, $menu]);
    }

    public function show(Request $request, Workspace $workspace, Menu $menu): Response
    {
        $this->ensureMenuInWorkspace($workspace, $menu);
        $this->authorize('view', $menu);

        $menu->load(['sections.menuProducts.product', 'menuProducts.product']);

        $attachedIds = $menu->menuProducts->pluck('product_id');

        $mapItem = fn ($item): array => [
            'id' => $item->id,
            'product_id' => $item->product_id,
            'menu_section_id' => $item->menu_section_id,
            'name' => $item->product->name,
            'description' => $item->product->description,
            'price' => $item->product->price,
            'product_active' => $item->product->active,
            'active' => $item->active,
            'position' => $item->position,
            'image_url' => $item->product->imageUrl(),
        ];

        return Inertia::render('menus/show', [
            'menu' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'slug' => $menu->slug,
                'description' => $menu->description,
                'status' => $menu->status->value,
                'public_url' => route('menus.public', $menu),
            ],
            'sections' => $menu->sections->map(fn ($section): array => [
                'id' => $section->id,
                'name' => $section->name,
                'description' => $section->description,
                'active' => $section->active,
                'position' => $section->position,
                'items' => $section->menuProducts->map($mapItem)->values(),
            ])->values(),
            'unsectionedItems' => $menu->menuProducts
                ->whereNull('menu_section_id')
                ->sortBy('position')
                ->values()
                ->map($mapItem),
            'availableProducts' => $workspace->products()
                ->whereNotIn('id', $attachedIds)
                ->orderBy('name')
                ->get(['id', 'name', 'price', 'active']),
            'statuses' => collect(MenuStatus::cases())->map(fn (MenuStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
            'canManage' => $request->user()->can('update', $menu),
        ]);
    }

    public function update(
        UpdateMenuRequest $request,
        Workspace $workspace,
        Menu $menu,
        UpdateMenuAction $updateMenu,
    ): RedirectResponse {
        $this->ensureMenuInWorkspace($workspace, $menu);

        $updateMenu->handle($menu, $request->menuData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Cardápio atualizado com sucesso.',
        ]);

        return back();
    }

    public function destroy(
        Request $request,
        Workspace $workspace,
        Menu $menu,
        DeleteMenuAction $deleteMenu,
    ): RedirectResponse {
        $this->ensureMenuInWorkspace($workspace, $menu);
        $this->authorize('delete', $menu);

        $deleteMenu->handle($menu);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Cardápio excluído.',
        ]);

        return to_route('workspace.menus.index', $workspace);
    }

    private function ensureMenuInWorkspace(Workspace $workspace, Menu $menu): void
    {
        abort_unless($menu->workspace_id === $workspace->id, 404);
    }
}
