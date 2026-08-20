<?php

namespace App\Actions\Menus;

use App\Enums\MenuStatus;
use App\Models\Menu;

class UpdateMenuAction
{
    /**
     * @param  array{name: string, description?: string|null, status: MenuStatus, banner_color: string}  $data
     */
    public function handle(Menu $menu, array $data): Menu
    {
        $menu->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'],
            'banner_color' => $data['banner_color'],
        ]);

        return $menu->refresh();
    }
}
