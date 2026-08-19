<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;

class WorkspaceMemberPolicy
{
    public function viewAny(User $user, Workspace $workspace): bool
    {
        return $user->hasRoleIn($workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function invite(User $user, Workspace $workspace): bool
    {
        return $user->hasRoleIn($workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function update(User $user, WorkspaceMember $member): bool
    {
        if ($member->role === WorkspaceRole::Owner) {
            return false;
        }

        return $user->hasRoleIn($member->workspace, WorkspaceRole::Owner);
    }

    public function delete(User $user, WorkspaceMember $member): bool
    {
        if ($member->role === WorkspaceRole::Owner) {
            return false;
        }

        return $user->hasRoleIn($member->workspace, WorkspaceRole::Owner);
    }
}
