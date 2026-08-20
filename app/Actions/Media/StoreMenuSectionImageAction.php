<?php

namespace App\Actions\Media;

use App\Models\MenuSection;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;
use Illuminate\Http\UploadedFile;

class StoreMenuSectionImageAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(MenuSection $section, UploadedFile $file): MenuSection
    {
        $path = $this->images->store($file, ImageVariant::MenuSection, $section->id);

        $section->update([
            'image_path' => $path,
            'image_version' => $section->image_version + 1,
        ]);

        return $section->refresh();
    }
}
