<?php

namespace App\Http\Controllers;

use App\Actions\Workspaces\CreateWorkspaceAction;
use App\Actions\Workspaces\DeleteWorkspaceAction;
use App\Http\Requests\Workspaces\StoreWorkspaceRequest;
use App\Http\Requests\Workspaces\UpdateWorkspaceRequest;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('workspaces/create', [
            'canCreate' => request()->user()->canCreateWorkspace(),
        ]);
    }

    public function store(StoreWorkspaceRequest $request, CreateWorkspaceAction $createWorkspace): RedirectResponse
    {
        $workspace = $createWorkspace->handle(
            $request->user(),
            $request->validated('name'),
        );

        session(['current_workspace_id' => $workspace->id]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ambiente criado com sucesso.',
        ]);

        return to_route('workspace.dashboard', $workspace);
    }

    public function edit(Request $request, Workspace $workspace): Response
    {
        abort_unless(
            $request->user()->can('update', $workspace)
            || $request->user()->can('updateBranding', $workspace),
            403,
        );

        return Inertia::render('workspaces/settings', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'logo_url' => $workspace->logoUrl(),
                'cover_url' => $workspace->coverUrl(),
            ],
        ]);
    }

    public function update(UpdateWorkspaceRequest $request, Workspace $workspace): RedirectResponse
    {
        $workspace->update([
            'name' => $request->validated('name'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ambiente atualizado com sucesso.',
        ]);

        return back();
    }

    public function destroy(Request $request, Workspace $workspace, DeleteWorkspaceAction $deleteWorkspace): RedirectResponse
    {
        $this->authorize('delete', $workspace);

        $deleteWorkspace->handle($workspace);

        $request->session()->forget('current_workspace_id');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ambiente excluído com sucesso.',
        ]);

        return to_route('dashboard');
    }
}
