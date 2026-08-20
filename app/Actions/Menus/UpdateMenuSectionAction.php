<?php

namespace App\Actions\Menus;

use App\Enums\SectionImageSide;
use App\Models\MenuSection;

class UpdateMenuSectionAction
{
    /**
     * @param  array{name: string, description?: string|null, background_color: string, image_side: SectionImageSide}  $data
     */
    public function handle(MenuSection $section, array $data): MenuSection
    {
        $section->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'background_color' => $data['background_color'],
            'image_side' => $data['image_side'],
        ]);

        return $section->refresh();
    }
}
