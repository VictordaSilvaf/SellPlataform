<?php

namespace App\Actions\Invitations;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AcceptInvitationAction
{
    public function handle(User $user, string $token): Workspace
    {
        return DB::transaction(function () use ($user, $token): Workspace {
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

            $workspace = $invitation->workspace()->lockForUpdate()->firstOrFail();

            if (! $user->isMemberOf($workspace)) {
                $workspace->members()->create([
                    'user_id' => $user->id,
                    'role' => $invitation->role === WorkspaceRole::Owner
                        ? WorkspaceRole::Member
                        : $invitation->role,
                ]);
            }

            $invitation->forceFill([
                'accepted_at' => now(),
            ])->save();

            $user->unreadNotifications
                ->filter(fn ($notification) => (int) ($notification->data['invitation_id'] ?? 0) === $invitation->id)
                ->each->markAsRead();

            return $workspace;
        });
    }
}
