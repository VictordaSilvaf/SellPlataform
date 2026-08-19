<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Sale;
use App\Models\User;
use App\Models\Workspace;

class SalePolicy
{
    public function viewAny(User $user, Workspace $workspace): bool
    {
        return $user->isMemberOf($workspace);
    }

    public function view(User $user, Sale $sale): bool
    {
        return $user->isMemberOf($sale->workspace);
    }

    public function create(User $user, Workspace $workspace): bool
    {
        return $user->isMemberOf($workspace);
    }

    public function updatePayment(User $user, Sale $sale): bool
    {
        return $user->hasRoleIn($sale->workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }

    public function cancel(User $user, Sale $sale): bool
    {
        return $user->hasRoleIn($sale->workspace, WorkspaceRole::Owner, WorkspaceRole::Admin);
    }
}
