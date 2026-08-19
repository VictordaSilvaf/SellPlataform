<?php

namespace App\Actions\Menus;

use App\Enums\MenuStatus;
use App\Models\Menu;

class UpdateMenuAction
{
    /**
     * @param  array{name: string, description?: string|null, status: MenuStatus}  $data
     */
    public function handle(Menu $menu, array $data): Menu
    {
        $menu->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'],
        ]);

        return $menu->refresh();
    }
}
