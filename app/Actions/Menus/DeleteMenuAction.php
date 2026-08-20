<?php

namespace App\Actions\Menus;

use App\Actions\Media\DeleteMenuBannerAction;
use App\Actions\Media\DeleteMenuSectionImageAction;
use App\Models\Menu;
use Illuminate\Support\Facades\DB;

class DeleteMenuAction
{
    public function __construct(
        private DeleteMenuBannerAction $deleteBanner,
        private DeleteMenuSectionImageAction $deleteSectionImage,
    ) {}

    public function handle(Menu $menu): void
    {
        DB::transaction(function () use ($menu): void {
            $menu->load('sections');

            foreach ($menu->sections as $section) {
                $this->deleteSectionImage->handle($section);
            }

            $this->deleteBanner->handle($menu);

            $menu->delete();
        });
    }
}
