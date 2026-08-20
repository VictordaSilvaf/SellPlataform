<?php

namespace App\Actions\Media;

use App\Models\Menu;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;

class DeleteMenuBannerAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(Menu $menu): void
    {
        if ($menu->banner_path === null) {
            return;
        }

        $this->images->delete(ImageVariant::MenuBanner, $menu->id);

        $menu->update([
            'banner_path' => null,
            'banner_version' => 0,
        ]);
    }
}
