<?php

namespace App\Actions\Media;

use App\Models\MenuSection;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;

class DeleteMenuSectionImageAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(MenuSection $section): void
    {
        if ($section->image_path === null) {
            return;
        }

        $this->images->delete(ImageVariant::MenuSection, $section->id);

        $section->update([
            'image_path' => null,
            'image_version' => 0,
        ]);
    }
}
