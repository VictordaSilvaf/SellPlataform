<?php

namespace App\Actions\Workspaces;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateWorkspaceAction
{
    public function handle(User $user, string $name): Workspace
    {
        return DB::transaction(function () use ($user, $name): Workspace {
            $user = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $user->load('plan');

            $ownedCount = Workspace::query()
                ->where('owner_id', $user->id)
                ->lockForUpdate()
                ->pluck('id')
                ->count();

            if ($ownedCount >= $user->plan->max_workspaces) {
                throw ValidationException::withMessages([
                    'name' => 'Você atingiu o limite de 3 ambientes do plano Free.',
                ]);
            }

            $workspace = Workspace::query()->create([
                'owner_id' => $user->id,
                'name' => $name,
                'slug' => Workspace::uniqueSlug($name),
            ]);

            $workspace->members()->create([
                'user_id' => $user->id,
                'role' => WorkspaceRole::Owner,
            ]);

            return $workspace;
        });
    }
}
