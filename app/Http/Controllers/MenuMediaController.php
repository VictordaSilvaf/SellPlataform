<?php

namespace App\Http\Controllers;

use App\Actions\Media\DeleteMenuBannerAction;
use App\Actions\Media\StoreMenuBannerAction;
use App\Http\Requests\Media\StoreImageRequest;
use App\Models\Menu;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class MenuMediaController extends Controller
{
    public function store(
        StoreImageRequest $request,
        Workspace $workspace,
        Menu $menu,
        StoreMenuBannerAction $storeBanner,
    ): RedirectResponse {
        abort_unless($menu->workspace_id === $workspace->id, 404);
        $this->authorize('update', $menu);

        $storeBanner->handle($menu, $request->uploadedImage());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Banner atualizado.',
        ]);

        return back();
    }

    public function destroy(
        Workspace $workspace,
        Menu $menu,
        DeleteMenuBannerAction $deleteBanner,
    ): RedirectResponse {
        abort_unless($menu->workspace_id === $workspace->id, 404);
        $this->authorize('update', $menu);

        $deleteBanner->handle($menu);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Banner removido.',
        ]);

        return back();
    }
}
