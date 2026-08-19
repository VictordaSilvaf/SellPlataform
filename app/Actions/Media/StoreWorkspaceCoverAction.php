<?php

namespace App\Actions\Media;

use App\Models\Workspace;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;
use Illuminate\Http\UploadedFile;

class StoreWorkspaceCoverAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(Workspace $workspace, UploadedFile $file): Workspace
    {
        $path = $this->images->store($file, ImageVariant::Cover, $workspace->id);

        $workspace->update([
            'cover_path' => $path,
            'cover_version' => $workspace->cover_version + 1,
        ]);

        return $workspace->refresh();
    }
}
