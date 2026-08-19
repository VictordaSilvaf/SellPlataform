<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    public function view(User $user, Workspace $workspace): bool
    {
        return $user->isMemberOf($workspace);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Workspace $workspace): bool
    {
        return $user->hasRoleIn($workspace, WorkspaceRole::Owner);
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        return $user->hasRoleIn($workspace, WorkspaceRole::Owner);
    }

    public function viewPlan(User $user, Workspace $workspace): bool
    {
        return $user->hasRoleIn($workspace, WorkspaceRole::Owner);
    }
}
