<?php

namespace App\Actions\Menus;

use App\Enums\SectionImageSide;
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
        $nextPosition = $position + 1;

        return $menu->sections()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'position' => $nextPosition,
            'image_side' => $nextPosition % 2 === 0
                ? SectionImageSide::Right
                : SectionImageSide::Left,
            'active' => true,
        ]);
    }
}
