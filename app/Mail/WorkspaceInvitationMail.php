<?php

namespace App\Mail;

use App\Models\WorkspaceInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WorkspaceInvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public WorkspaceInvitation $invitation)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Você foi convidado para '.$this->invitation->workspace->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.invitations.existing-user',
            with: [
                'workspaceName' => $this->invitation->workspace->name,
                'inviterName' => $this->invitation->inviter->name,
                'url' => url('/notifications'),
            ],
        );
    }
}
