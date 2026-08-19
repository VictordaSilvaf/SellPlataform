<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkspacePlanController extends Controller
{
    public function __invoke(Request $request, Workspace $workspace): Response
    {
        $this->authorize('viewPlan', $workspace);

        $owner = $workspace->owner()->with('plan')->firstOrFail();

        return Inertia::render('workspaces/plan', [
            'plan' => [
                'name' => $owner->plan->name,
                'max_workspaces' => $owner->plan->max_workspaces,
                'max_members' => $owner->plan->max_members,
                'max_menus' => $owner->plan->max_menus,
                'owned_workspaces' => $owner->ownedWorkspaceCount(),
                'current_members' => $workspace->occupiedMemberSlots(),
                'current_menus' => $workspace->menus()->count(),
            ],
        ]);
    }
}
