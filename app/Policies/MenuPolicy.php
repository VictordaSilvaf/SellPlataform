<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Menu;
use App\Models\User;
use App\Models\Workspace;

class MenuPolicy
{
    public function viewAny(User $user, Workspace $workspace): bool
    {
        return $user->isMemberOf($workspace);
    }

    public function view(User $user, Menu $menu): bool
    {
        return $user->isMemberOf($menu->workspace);
    }

    public function create(User $user, Workspace $workspace): bool
    {
        return $user->hasRoleIn($workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function update(User $user, Menu $menu): bool
    {
        return $user->hasRoleIn($menu->workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function delete(User $user, Menu $menu): bool
    {
        return $user->hasRoleIn($menu->workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function addProducts(User $user, Menu $menu): bool
    {
        return $this->update($user, $menu);
    }

    public function removeProduct(User $user, Menu $menu): bool
    {
        return $this->update($user, $menu);
    }

    public function reorder(User $user, Menu $menu): bool
    {
        return $this->update($user, $menu);
    }
}
