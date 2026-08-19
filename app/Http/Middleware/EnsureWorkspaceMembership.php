<?php

namespace App\Http\Middleware;

use App\Models\Workspace;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceMembership
{
    public function handle(Request $request, Closure $next): Response
    {
        $workspace = $request->route('workspace');
        $user = $request->user();

        abort_unless($user && $workspace instanceof Workspace, 403);
        abort_unless($user->isMemberOf($workspace), 403);

        Context::add('workspace_id', $workspace->id);
        session(['current_workspace_id' => $workspace->id]);

        return $next($request);
    }
}
