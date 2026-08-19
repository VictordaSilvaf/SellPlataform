<?php

namespace App\Actions\Menus;

use App\Models\MenuSection;
use Illuminate\Support\Facades\DB;

class DeleteMenuSectionAction
{
    public function handle(MenuSection $section): void
    {
        DB::transaction(function () use ($section): void {
            $section->menuProducts()->update(['menu_section_id' => null]);
            $section->delete();
        });
    }
}
