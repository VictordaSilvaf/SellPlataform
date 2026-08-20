<?php

namespace App\Http\Controllers;

use App\Enums\MenuStatus;
use App\Models\Menu;
use App\Models\MenuProduct;
use App\Models\MenuSection;
use Inertia\Inertia;
use Inertia\Response;

class PublicMenuController extends Controller
{
    public function __invoke(Menu $menu): Response
    {
        $menu->load(['workspace', 'sections.menuProducts.product', 'menuProducts.product']);

        $available = $menu->status === MenuStatus::Active;

        /**
         * @return array{name: string, description: string|null, price: int, image_url: string|null}
         */
        $mapProduct = fn (MenuProduct $item): array => [
            'name' => $item->product->name,
            'description' => $item->product->description,
            'price' => $item->product->price,
            'image_url' => $item->product->imageUrl(),
        ];

        $unsectioned = $available
            ? $menu->menuProducts
                ->whereNull('menu_section_id')
                ->filter(fn (MenuProduct $item): bool => $item->isPubliclyAvailable())
                ->sortBy('position')
                ->values()
                ->map($mapProduct)
                ->all()
            : [];

        $sections = $available
            ? $menu->sections
                ->filter(fn (MenuSection $section): bool => $section->active)
                ->map(function (MenuSection $section) use ($mapProduct): ?array {
                    $products = $section->menuProducts
                        ->filter(fn (MenuProduct $item): bool => $item->isPubliclyAvailable())
                        ->sortBy('position')
                        ->values()
                        ->map($mapProduct)
                        ->all();

                    if ($products === []) {
                        return null;
                    }

                    return [
                        'name' => $section->name,
                        'description' => $section->description,
                        'background_color' => $section->background_color,
                        'image_url' => $section->imageUrl(),
                        'image_side' => $section->image_side->value,
                        'products' => $products,
                    ];
                })
                ->filter()
                ->values()
                ->all()
            : [];

        return Inertia::render('public/menu', [
            'available' => $available,
            'workspace' => [
                'name' => $menu->workspace->name,
                'logo_url' => $menu->workspace->logoUrl(),
            ],
            'menu' => [
                'name' => $menu->name,
                'description' => $menu->description,
                'banner_url' => $menu->bannerUrl(),
                'banner_color' => $menu->banner_color,
            ],
            'unsectioned' => $unsectioned,
            'sections' => $sections,
        ]);
    }
}
