<?php

namespace App\Actions\Menus;

use App\Models\Menu;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReorderMenuProductsAction
{
    /**
     * @param  list<array{product_id: int, menu_section_id: int|null, position: int}>  $items
     */
    public function handle(Menu $menu, array $items): void
    {
        DB::transaction(function () use ($menu, $items): void {
            $existingIds = $menu->menuProducts()
                ->lockForUpdate()
                ->pluck('product_id')
                ->sort()
                ->values();

            $incomingIds = collect($items)->pluck('product_id')->sort()->values();

            if ($existingIds->all() !== $incomingIds->all()) {
                throw ValidationException::withMessages([
                    'items' => 'A ordem deve incluir todos os produtos do cardápio.',
                ]);
            }

            $sectionIds = $menu->sections()->pluck('id');

            foreach ($items as $item) {
                $sectionId = $item['menu_section_id'];

                if ($sectionId !== null && ! $sectionIds->contains($sectionId)) {
                    throw ValidationException::withMessages([
                        'items' => 'A sessão não pertence a este cardápio.',
                    ]);
                }

                $menu->menuProducts()
                    ->where('product_id', $item['product_id'])
                    ->update([
                        'menu_section_id' => $sectionId,
                        'position' => $item['position'],
                    ]);
            }
        });
    }
}
