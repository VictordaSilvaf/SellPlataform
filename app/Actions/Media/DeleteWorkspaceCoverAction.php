<?php

namespace App\Actions\Media;

use App\Models\Workspace;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;

class DeleteWorkspaceCoverAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(Workspace $workspace): void
    {
        if ($workspace->cover_path === null) {
            return;
        }

        $this->images->delete(ImageVariant::Cover, $workspace->id);

        $workspace->update([
            'cover_path' => null,
            'cover_version' => 0,
        ]);
    }
}
