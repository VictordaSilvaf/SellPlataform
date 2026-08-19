<?php

namespace App\Support;

use App\Models\User;
use App\Models\Workspace;

class UserHome
{
    public function url(?User $user): string
    {
        if (! $user) {
            return route('login');
        }

        $workspace = $this->current($user);

        if ($workspace) {
            return route('workspace.dashboard', $workspace);
        }

        return route('workspaces.create');
    }

    public function current(User $user): ?Workspace
    {
        $workspaceId = session('current_workspace_id');

        if ($workspaceId) {
            $workspace = $user->workspaces()->where('workspaces.id', $workspaceId)->first();

            if ($workspace) {
                return $workspace;
            }
        }

        return $user->workspaces()->orderBy('workspaces.name')->first();
    }
}
