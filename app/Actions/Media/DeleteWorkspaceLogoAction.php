<?php

namespace App\Actions\Media;

use App\Models\Workspace;
use App\Support\Images\ImageUploadService;
use App\Support\Images\ImageVariant;

class DeleteWorkspaceLogoAction
{
    public function __construct(private ImageUploadService $images) {}

    public function handle(Workspace $workspace): void
    {
        if ($workspace->logo_path === null) {
            return;
        }

        $this->images->delete(ImageVariant::Logo, $workspace->id);

        $workspace->update([
            'logo_path' => null,
            'logo_version' => 0,
        ]);
    }
}
