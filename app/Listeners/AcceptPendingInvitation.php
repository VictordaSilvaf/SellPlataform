<?php

namespace App\Listeners;

use App\Actions\Invitations\AcceptInvitationAction;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Validation\ValidationException;

class AcceptPendingInvitation
{
    public function __construct(private AcceptInvitationAction $acceptInvitation) {}

    public function handle(Verified $event): void
    {
        $user = $event->user;

        if (! $user instanceof User) {
            return;
        }

        $token = session('invitation_token');

        if (! $token) {
            return;
        }

        try {
            $workspace = $this->acceptInvitation->handle($user, $token);
            session()->forget('invitation_token');
            session(['current_workspace_id' => $workspace->id]);
        } catch (ValidationException) {
            session()->forget('invitation_token');
        }
    }
}
