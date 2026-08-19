<?php

namespace App\Http\Controllers;

use App\Actions\Invitations\AcceptInvitationAction;
use App\Actions\Invitations\RejectInvitationAction;
use App\Http\Requests\Invitations\InvitationTokenRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(20);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function accept(InvitationTokenRequest $request, AcceptInvitationAction $accept): RedirectResponse
    {
        $workspace = $accept->handle($request->user(), $request->validated('token'));

        session(['current_workspace_id' => $workspace->id]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Convite aceito. Bem-vindo ao ambiente.',
        ]);

        return to_route('workspace.dashboard', $workspace);
    }

    public function reject(InvitationTokenRequest $request, RejectInvitationAction $reject): RedirectResponse
    {
        $reject->handle($request->user(), $request->validated('token'));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Convite recusado.',
        ]);

        return back();
    }
}
