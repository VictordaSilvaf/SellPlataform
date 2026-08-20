<?php

namespace App\Http\Controllers;

use App\Actions\Media\DeleteMenuSectionImageAction;
use App\Actions\Media\StoreMenuSectionImageAction;
use App\Http\Requests\Media\StoreImageRequest;
use App\Models\Menu;
use App\Models\MenuSection;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class MenuSectionMediaController extends Controller
{
    public function store(
        StoreImageRequest $request,
        Workspace $workspace,
        Menu $menu,
        MenuSection $section,
        StoreMenuSectionImageAction $storeImage,
    ): RedirectResponse {
        $this->ensureSectionInMenu($workspace, $menu, $section);
        $this->authorize('update', $menu);

        $storeImage->handle($section, $request->uploadedImage());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Imagem da sessão atualizada.',
        ]);

        return back();
    }

    public function destroy(
        Workspace $workspace,
        Menu $menu,
        MenuSection $section,
        DeleteMenuSectionImageAction $deleteImage,
    ): RedirectResponse {
        $this->ensureSectionInMenu($workspace, $menu, $section);
        $this->authorize('update', $menu);

        $deleteImage->handle($section);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Imagem da sessão removida.',
        ]);

        return back();
    }

    private function ensureSectionInMenu(Workspace $workspace, Menu $menu, MenuSection $section): void
    {
        abort_unless($menu->workspace_id === $workspace->id, 404);
        abort_unless($section->menu_id === $menu->id, 404);
    }
}
