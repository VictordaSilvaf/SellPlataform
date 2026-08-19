<?php

namespace App\Support\Images;

use Illuminate\Support\Facades\Storage;

class ImageUrl
{
    public static function public(?string $path, int $version): ?string
    {
        if ($path === null || $path === '' || $version < 1) {
            return null;
        }

        return Storage::disk(config('filesystems.default'))->url($path).'?v='.$version;
    }
}
