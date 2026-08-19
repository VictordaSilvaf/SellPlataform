<?php

namespace App\Http\Controllers;

use App\Actions\Media\DeleteWorkspaceCoverAction;
use App\Actions\Media\DeleteWorkspaceLogoAction;
use App\Actions\Media\StoreWorkspaceCoverAction;
use App\Actions\Media\StoreWorkspaceLogoAction;
use App\Http\Requests\Media\StoreImageRequest;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class WorkspaceMediaController extends Controller
{
    public function storeLogo(
        StoreImageRequest $request,
        Workspace $workspace,
        StoreWorkspaceLogoAction $storeLogo,
    ): RedirectResponse {
        $this->authorize('updateBranding', $workspace);

        $storeLogo->handle($workspace, $request->uploadedImage());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Logo atualizada.',
        ]);

        return back();
    }

    public function destroyLogo(
        Workspace $workspace,
        DeleteWorkspaceLogoAction $deleteLogo,
    ): RedirectResponse {
        $this->authorize('updateBranding', $workspace);

        $deleteLogo->handle($workspace);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Logo removida.',
        ]);

        return back();
    }

    public function storeCover(
        StoreImageRequest $request,
        Workspace $workspace,
        StoreWorkspaceCoverAction $storeCover,
    ): RedirectResponse {
        $this->authorize('updateBranding', $workspace);

        $storeCover->handle($workspace, $request->uploadedImage());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Capa atualizada.',
        ]);

        return back();
    }

    public function destroyCover(
        Workspace $workspace,
        DeleteWorkspaceCoverAction $deleteCover,
    ): RedirectResponse {
        $this->authorize('updateBranding', $workspace);

        $deleteCover->handle($workspace);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Capa removida.',
        ]);

        return back();
    }
}
