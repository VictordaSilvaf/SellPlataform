<?php

namespace App\Actions\Menus;

use App\Actions\Media\DeleteMenuSectionImageAction;
use App\Models\MenuSection;
use Illuminate\Support\Facades\DB;

class DeleteMenuSectionAction
{
    public function __construct(private DeleteMenuSectionImageAction $deleteSectionImage) {}

    public function handle(MenuSection $section): void
    {
        DB::transaction(function () use ($section): void {
            $this->deleteSectionImage->handle($section);
            $section->menuProducts()->update(['menu_section_id' => null]);
            $section->delete();
        });
    }
}
