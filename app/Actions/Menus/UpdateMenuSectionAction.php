<?php

namespace App\Actions\Menus;

use App\Models\MenuSection;

class UpdateMenuSectionAction
{
    /**
     * @param  array{name: string, description?: string|null}  $data
     */
    public function handle(MenuSection $section, array $data): MenuSection
    {
        $section->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return $section->refresh();
    }
}
