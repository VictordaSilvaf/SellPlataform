<?php

namespace App\Http\Middleware;

use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Support\UserHome;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function __construct(private UserHome $userHome) {}

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $workspace = $request->route('workspace');
        $currentWorkspace = $workspace instanceof Workspace ? $workspace : null;

        if (! $currentWorkspace && $user) {
            $currentWorkspace = $this->userHome->current($user);
        }

        $currentRole = $currentWorkspace && $user
            ? $user->roleIn($currentWorkspace)
            : null;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'workspaces' => $user
                ? $user->memberships()
                    ->with('workspace')
                    ->get()
                    ->sortBy(fn (WorkspaceMember $member): string => $member->workspace->name)
                    ->values()
                    ->map(fn (WorkspaceMember $member): array => [
                        'id' => $member->workspace->id,
                        'name' => $member->workspace->name,
                        'slug' => $member->workspace->slug,
                        'role' => $member->role->value,
                    ])
                : [],
            'currentWorkspace' => $currentWorkspace ? [
                'id' => $currentWorkspace->id,
                'name' => $currentWorkspace->name,
                'slug' => $currentWorkspace->slug,
            ] : null,
            'currentRole' => $currentRole?->value,
            'can' => [
                'manageWorkspace' => $currentRole?->canManageWorkspace() ?? false,
                'manageMembers' => $currentRole?->canManageMembers() ?? false,
                'manageProducts' => $currentRole?->canManageProducts() ?? false,
                'manageSales' => $currentRole?->canManageSales() ?? false,
                'createSales' => $currentRole?->canCreateSales() ?? false,
                'viewReports' => $currentRole?->canViewReports() ?? false,
                'createWorkspace' => $user?->canCreateWorkspace() ?? false,
            ],
            'unreadNotificationsCount' => $user?->unreadNotifications()->count() ?? 0,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
