<?php

namespace App\Actions\Media;

use App\Models\Workspace;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;
use Illuminate\Http\UploadedFile;

class StoreWorkspaceLogoAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(Workspace $workspace, UploadedFile $file): Workspace
    {
        $path = $this->images->store($file, ImageVariant::Logo, $workspace->id);

        $workspace->update([
            'logo_path' => $path,
            'logo_version' => $workspace->logo_version + 1,
        ]);

        return $workspace->refresh();
    }
}
