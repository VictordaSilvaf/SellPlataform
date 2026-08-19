<?php

namespace App\Support;

use App\Models\Menu;
use App\Models\Workspace;
use Illuminate\Validation\ValidationException;

class MenuLimitChecker
{
    public function allows(Workspace $workspace): bool
    {
        $workspace->loadMissing('owner.plan');

        return $workspace->owner->plan->allowsAnotherMenu($workspace->menus()->count());
    }

    public function assertCanCreate(Workspace $workspace): void
    {
        $workspace->loadMissing('owner.plan');

        $currentCount = Menu::query()
            ->where('workspace_id', $workspace->id)
            ->lockForUpdate()
            ->pluck('id')
            ->count();

        if ($workspace->owner->plan->allowsAnotherMenu($currentCount)) {
            return;
        }

        $max = $workspace->owner->plan->max_menus;
        $label = $max === 1 ? 'cardápio' : 'cardápios';

        throw ValidationException::withMessages([
            'name' => "Você atingiu o limite de {$max} {$label} do plano {$workspace->owner->plan->name}.",
        ]);
    }
}
