<?php

namespace App\Actions\Invitations;

use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RejectInvitationAction
{
    public function handle(User $user, string $token): void
    {
        DB::transaction(function () use ($user, $token): void {
            $invitation = WorkspaceInvitation::query()
                ->where('token', $token)
                ->lockForUpdate()
                ->first();

            if (! $invitation || ! $invitation->isPending()) {
                throw ValidationException::withMessages([
                    'invitation' => 'Este convite é inválido, expirou ou já foi utilizado.',
                ]);
            }

            if (mb_strtolower($user->email) !== $invitation->email) {
                throw ValidationException::withMessages([
                    'invitation' => 'Este convite foi enviado para outro e-mail.',
                ]);
            }

            $invitation->forceFill([
                'rejected_at' => now(),
            ])->save();

            $user->unreadNotifications
                ->filter(fn ($notification) => (int) ($notification->data['invitation_id'] ?? 0) === $invitation->id)
                ->each->markAsRead();
        });
    }
}
