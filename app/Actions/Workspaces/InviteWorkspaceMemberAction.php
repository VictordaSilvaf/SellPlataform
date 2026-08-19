<?php

namespace App\Actions\Workspaces;

use App\Enums\WorkspaceRole;
use App\Mail\NewUserWorkspaceInvitationMail;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Notifications\WorkspaceInvitationNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class InviteWorkspaceMemberAction
{
    public function handle(Workspace $workspace, User $inviter, string $email, WorkspaceRole $role): WorkspaceInvitation
    {
        $email = mb_strtolower($email);
        $workspace->loadMissing('owner.plan');

        if ($workspace->occupiedMemberSlots() >= $workspace->owner->plan->max_members) {
            throw ValidationException::withMessages([
                'email' => 'Você atingiu o limite de 3 membros do plano Free.',
            ]);
        }

        $existingUser = User::query()->where('email', $email)->first();

        if ($existingUser && $existingUser->isMemberOf($workspace)) {
            throw ValidationException::withMessages([
                'email' => 'Este usuário já faz parte deste ambiente.',
            ]);
        }

        $pendingExists = $workspace->invitations()
            ->pending()
            ->where('email', $email)
            ->exists();

        if ($pendingExists) {
            throw ValidationException::withMessages([
                'email' => 'Já existe um convite pendente para este e-mail.',
            ]);
        }

        $invitation = $workspace->invitations()->create([
            'invited_by' => $inviter->id,
            'email' => $email,
            'role' => $role,
            'token' => WorkspaceInvitation::generateToken(),
            'expires_at' => now()->addDays(7),
        ]);

        $invitation->load(['workspace', 'inviter']);

        if ($existingUser) {
            $existingUser->notify((new WorkspaceInvitationNotification($invitation))->afterCommit());
        } else {
            Mail::to($email)->queue((new NewUserWorkspaceInvitationMail($invitation))->afterCommit());
        }

        return $invitation;
    }
}
