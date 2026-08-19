<?php

namespace App\Notifications;

use App\Mail\WorkspaceInvitationMail;
use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WorkspaceInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public WorkspaceInvitation $invitation) {}

    /**
     * @return list<string>
     */
    public function via(User $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(User $notifiable): WorkspaceInvitationMail
    {
        return (new WorkspaceInvitationMail($this->invitation))
            ->to($notifiable->email);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(User $notifiable): array
    {
        $this->invitation->loadMissing(['workspace', 'inviter']);

        return [
            'type' => 'workspace_invitation',
            'invitation_id' => $this->invitation->id,
            'token' => $this->invitation->token,
            'workspace_id' => $this->invitation->workspace_id,
            'workspace_name' => $this->invitation->workspace->name,
            'inviter_name' => $this->invitation->inviter->name,
            'role' => $this->invitation->role->value,
        ];
    }
}
