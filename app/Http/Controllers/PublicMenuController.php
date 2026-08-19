<?php

namespace App\Http\Controllers;

use App\Enums\MenuStatus;
use App\Models\Menu;
use Inertia\Inertia;
use Inertia\Response;

class PublicMenuController extends Controller
{
    public function __invoke(Menu $menu): Response
    {
        $menu->load(['workspace', 'menuProducts.product']);

        $available = $menu->status === MenuStatus::Active;

        return Inertia::render('public/menu', [
            'available' => $available,
            'workspace' => [
                'name' => $menu->workspace->name,
            ],
            'menu' => [
                'name' => $menu->name,
                'description' => $menu->description,
            ],
            'products' => $available
                ? $menu->menuProducts
                    ->filter(fn ($item) => $item->isPubliclyAvailable())
                    ->map(fn ($item) => [
                        'name' => $item->product->name,
                        'description' => $item->product->description,
                        'price' => $item->product->price,
                    ])
                    ->values()
                : [],
        ]);
    }
}
