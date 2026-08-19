<?php

namespace App\Actions\Menus;

use App\Models\MenuSection;

class ToggleMenuSectionAction
{
    public function handle(MenuSection $section, bool $active): MenuSection
    {
        $section->update(['active' => $active]);

        return $section->refresh();
    }
}
