<?php

namespace App\Actions\Menus;

use App\Models\Menu;
use App\Models\MenuSection;
use App\Models\Product;

class AddProductsToMenuAction
{
    /**
     * @param  list<int>  $productIds
     */
    public function handle(Menu $menu, array $productIds, ?int $sectionId = null): void
    {
        $section = $this->sectionFor($menu, $sectionId);

        $eligibleLookup = array_fill_keys(
            Product::query()
                ->where('workspace_id', $menu->workspace_id)
                ->whereIn('id', $productIds)
                ->whereNotIn('id', $menu->menuProducts()->select('product_id'))
                ->pluck('id')
                ->all(),
            true,
        );

        $query = $menu->menuProducts();

        if ($section === null) {
            $query->whereNull('menu_section_id');
        } else {
            $query->where('menu_section_id', $section->id);
        }

        $position = (int) $query->max('position');

        foreach ($productIds as $productId) {
            if (! isset($eligibleLookup[$productId])) {
                continue;
            }

            unset($eligibleLookup[$productId]);
            $position++;

            $menu->menuProducts()->create([
                'product_id' => $productId,
                'menu_section_id' => $section?->id,
                'position' => $position,
                'active' => true,
            ]);
        }
    }

    private function sectionFor(Menu $menu, ?int $sectionId): ?MenuSection
    {
        if ($sectionId === null) {
            return null;
        }

        return $menu->sections()->whereKey($sectionId)->first();
    }
}
