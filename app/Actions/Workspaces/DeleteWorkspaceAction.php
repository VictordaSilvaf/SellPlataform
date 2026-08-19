<?php

namespace App\Actions\Workspaces;

use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

class DeleteWorkspaceAction
{
    public function handle(Workspace $workspace): void
    {
        DB::transaction(function () use ($workspace): void {
            $workspace->sales()->each(function ($sale): void {
                $sale->items()->delete();
            });

            $workspace->sales()->delete();
            $workspace->products()->delete();
            $workspace->invitations()->delete();
            $workspace->customers()->delete();
            $workspace->members()->delete();
            $workspace->delete();
        });
    }
}
