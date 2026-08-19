<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;

class WorkspaceInvitationPolicy
{
    public function viewAny(User $user, Workspace $workspace): bool
    {
        return $user->hasRoleIn($workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function create(User $user, Workspace $workspace): bool
    {
        return $user->hasRoleIn($workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function delete(User $user, WorkspaceInvitation $invitation): bool
    {
        return $user->hasRoleIn($invitation->workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function resend(User $user, WorkspaceInvitation $invitation): bool
    {
        return $invitation->isPending()
            && $user->hasRoleIn($invitation->workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }
}
