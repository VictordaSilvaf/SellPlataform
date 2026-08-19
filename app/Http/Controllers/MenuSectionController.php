<?php

namespace App\Http\Controllers;

use App\Actions\Menus\CreateMenuSectionAction;
use App\Actions\Menus\DeleteMenuSectionAction;
use App\Actions\Menus\ReorderMenuSectionsAction;
use App\Actions\Menus\ToggleMenuSectionAction;
use App\Actions\Menus\UpdateMenuSectionAction;
use App\Http\Requests\Menus\ReorderMenuSectionsRequest;
use App\Http\Requests\Menus\StoreMenuSectionRequest;
use App\Http\Requests\Menus\ToggleMenuSectionRequest;
use App\Http\Requests\Menus\UpdateMenuSectionRequest;
use App\Models\Menu;
use App\Models\MenuSection;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class MenuSectionController extends Controller
{
    public function store(
        StoreMenuSectionRequest $request,
        Workspace $workspace,
        Menu $menu,
        CreateMenuSectionAction $createSection,
    ): RedirectResponse {
        $this->ensureMenuInWorkspace($workspace, $menu);

        $createSection->handle($menu, $request->sectionData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Sessão criada.',
        ]);

        return back();
    }

    public function update(
        UpdateMenuSectionRequest $request,
        Workspace $workspace,
        Menu $menu,
        MenuSection $section,
        UpdateMenuSectionAction $updateSection,
    ): RedirectResponse {
        $this->ensureSectionInMenu($workspace, $menu, $section);

        $updateSection->handle($section, $request->sectionData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Sessão atualizada.',
        ]);

        return back();
    }

    public function destroy(
        Workspace $workspace,
        Menu $menu,
        MenuSection $section,
        DeleteMenuSectionAction $deleteSection,
    ): RedirectResponse {
        $this->ensureSectionInMenu($workspace, $menu, $section);
        $this->authorize('update', $menu);

        $deleteSection->handle($section);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Sessão removida.',
        ]);

        return back();
    }

    public function toggle(
        ToggleMenuSectionRequest $request,
        Workspace $workspace,
        Menu $menu,
        MenuSection $section,
        ToggleMenuSectionAction $toggleSection,
    ): RedirectResponse {
        $this->ensureSectionInMenu($workspace, $menu, $section);

        $toggleSection->handle($section, $request->boolean('active'));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $request->boolean('active') ? 'Sessão ativada.' : 'Sessão desativada.',
        ]);

        return back();
    }

    public function order(
        ReorderMenuSectionsRequest $request,
        Workspace $workspace,
        Menu $menu,
        ReorderMenuSectionsAction $reorderSections,
    ): RedirectResponse {
        $this->ensureMenuInWorkspace($workspace, $menu);

        $reorderSections->handle($menu, $request->sectionIds());

        return back();
    }

    private function ensureMenuInWorkspace(Workspace $workspace, Menu $menu): void
    {
        abort_unless($menu->workspace_id === $workspace->id, 404);
    }

    private function ensureSectionInMenu(Workspace $workspace, Menu $menu, MenuSection $section): void
    {
        $this->ensureMenuInWorkspace($workspace, $menu);
        abort_unless($section->menu_id === $menu->id, 404);
    }
}
