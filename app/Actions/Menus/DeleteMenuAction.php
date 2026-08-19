<?php

namespace App\Actions\Menus;

use App\Models\Menu;

class DeleteMenuAction
{
    public function handle(Menu $menu): void
    {
        $menu->delete();
    }
}
