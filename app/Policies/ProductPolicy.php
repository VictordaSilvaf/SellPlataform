<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Product;
use App\Models\User;
use App\Models\Workspace;

class ProductPolicy
{
    public function viewAny(User $user, Workspace $workspace): bool
    {
        return $user->isMemberOf($workspace);
    }

    public function view(User $user, Product $product): bool
    {
        return $user->isMemberOf($product->workspace);
    }

    public function create(User $user, Workspace $workspace): bool
    {
        return $user->hasRoleIn($workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasRoleIn($product->workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasRoleIn($product->workspace, WorkspaceRole::Owner, WorkspaceRole::Admin)
            && ! $product->hasSales();
    }
}
