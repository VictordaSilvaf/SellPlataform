<?php

namespace App\Actions\Media;

use App\Models\Menu;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;
use Illuminate\Http\UploadedFile;

class StoreMenuBannerAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(Menu $menu, UploadedFile $file): Menu
    {
        $path = $this->images->store($file, ImageVariant::MenuBanner, $menu->id);

        $menu->update([
            'banner_path' => $path,
            'banner_version' => $menu->banner_version + 1,
        ]);

        return $menu->refresh();
    }
}
