<?php

namespace App\Actions\Menus;

use App\Models\Menu;
use App\Models\MenuSection;

class CreateMenuSectionAction
{
    /**
     * @param  array{name: string, description?: string|null}  $data
     */
    public function handle(Menu $menu, array $data): MenuSection
    {
        $position = (int) $menu->sections()->max('position');

        return $menu->sections()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'position' => $position + 1,
            'active' => true,
        ]);
    }
}
