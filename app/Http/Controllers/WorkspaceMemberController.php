<?php

namespace App\Http\Controllers;

use App\Actions\Workspaces\InviteWorkspaceMemberAction;
use App\Enums\WorkspaceRole;
use App\Http\Requests\Workspaces\InviteWorkspaceMemberRequest;
use App\Http\Requests\Workspaces\UpdateWorkspaceMemberRequest;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceMemberController extends Controller
{
    public function index(Request $request, Workspace $workspace): Response
    {
        $this->authorize('viewAny', [WorkspaceMember::class, $workspace]);

        $members = $workspace->members()
            ->with('user')
            ->orderBy('id')
            ->get();

        $invitations = $workspace->invitations()
            ->pending()
            ->with('inviter')
            ->latest()
            ->get();

        return Inertia::render('workspaces/members', [
            'members' => $members,
            'invitations' => $invitations,
            'assignableRoles' => collect(WorkspaceRole::assignable())->map(fn (WorkspaceRole $role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ]),
            'canInvite' => $request->user()->can('invite', [WorkspaceMember::class, $workspace]),
        ]);
    }

    public function store(
        InviteWorkspaceMemberRequest $request,
        Workspace $workspace,
        InviteWorkspaceMemberAction $invite,
    ): RedirectResponse {
        $invite->handle(
            $workspace,
            $request->user(),
            $request->validated('email'),
            WorkspaceRole::from($request->validated('role')),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Convite enviado com sucesso.',
        ]);

        return back();
    }

    public function update(UpdateWorkspaceMemberRequest $request, Workspace $workspace, WorkspaceMember $member): RedirectResponse
    {
        abort_unless($member->workspace_id === $workspace->id, 404);

        $member->update([
            'role' => WorkspaceRole::from($request->validated('role')),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Função atualizada com sucesso.',
        ]);

        return back();
    }

    public function destroy(Request $request, Workspace $workspace, WorkspaceMember $member): RedirectResponse
    {
        abort_unless($member->workspace_id === $workspace->id, 404);

        $this->authorize('delete', $member);

        $member->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Membro removido com sucesso.',
        ]);

        return back();
    }

    public function destroyInvitation(Request $request, Workspace $workspace, WorkspaceInvitation $invitation): RedirectResponse
    {
        abort_unless($invitation->workspace_id === $workspace->id, 404);

        $this->authorize('delete', $invitation);

        $invitation->update(['rejected_at' => now()]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Convite cancelado.',
        ]);

        return back();
    }

    public function resendInvitation(
        Request $request,
        Workspace $workspace,
        WorkspaceInvitation $invitation,
        InviteWorkspaceMemberAction $invite,
    ): RedirectResponse {
        abort_unless($invitation->workspace_id === $workspace->id, 404);

        $this->authorize('resend', $invitation);

        $email = $invitation->email;
        $role = $invitation->role;

        $invitation->update(['rejected_at' => now()]);

        $invite->handle($workspace, $request->user(), $email, $role);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Convite reenviado.',
        ]);

        return back();
    }
}
