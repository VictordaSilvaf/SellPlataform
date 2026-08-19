<?php

namespace App\Actions\Menus;

use App\Models\Menu;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReorderMenuSectionsAction
{
    /**
     * @param  list<int>  $sectionIds
     */
    public function handle(Menu $menu, array $sectionIds): void
    {
        DB::transaction(function () use ($menu, $sectionIds): void {
            $existingIds = $menu->sections()
                ->lockForUpdate()
                ->pluck('id')
                ->sort()
                ->values();

            $incomingIds = collect($sectionIds)->sort()->values();

            if ($existingIds->all() !== $incomingIds->all()) {
                throw ValidationException::withMessages([
                    'section_ids' => 'A ordem deve incluir todas as sessões do cardápio.',
                ]);
            }

            foreach ($sectionIds as $index => $sectionId) {
                $menu->sections()
                    ->whereKey($sectionId)
                    ->update(['position' => $index + 1]);
            }
        });
    }
}
