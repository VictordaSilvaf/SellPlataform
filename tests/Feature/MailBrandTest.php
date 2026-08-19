<?php

use App\Mail\NewUserWorkspaceInvitationMail;
use App\Mail\WorkspaceInvitationMail;
use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;

test('workspace invitation emails use the product palette and logo', function () {
    [$owner, $workspace] = userWithWorkspace(['name' => 'Ana']);

    $invitation = WorkspaceInvitation::factory()->create([
        'workspace_id' => $workspace->id,
        'invited_by' => $owner->id,
    ]);

    $html = strtolower((new WorkspaceInvitationMail($invitation))->render());

    expect($html)
        ->toContain('logo.png')
        ->toContain('#a67c62')
        ->toContain('#f3ebe5')
        ->toContain(strtolower($workspace->name))
        ->toContain('abrir convites')
        ->toContain('todos os direitos reservados');
});

test('new user invitation emails use the branded call to action', function () {
    [$owner, $workspace] = userWithWorkspace(['name' => 'Ana']);

    $invitation = WorkspaceInvitation::factory()->create([
        'workspace_id' => $workspace->id,
        'invited_by' => $owner->id,
    ]);

    $html = strtolower((new NewUserWorkspaceInvitationMail($invitation))->render());

    expect($html)
        ->toContain('logo.png')
        ->toContain('#a67c62')
        ->toContain('criar minha conta');
});

test('email verification messages are in portuguese and follow the brand', function () {
    $user = User::factory()->unverified()->create(['name' => 'João']);

    $mail = (new VerifyEmail)->toMail($user);
    $html = (string) $mail->render();

    expect($mail->subject)->toBe('Confirme seu e-mail');
    expect(config('mail.from.name'))->not->toContain('${');
    expect($html)
        ->toContain('Olá, João!')
        ->toContain('Confirmar e-mail')
        ->toContain(config('app.name'))
        ->not->toContain('${APP_NAME}')
        ->toContain('logo.png')
        ->toContain('#a67c62');
});

test('password reset messages are in portuguese and follow the brand', function () {
    $user = User::factory()->create(['name' => 'Maria']);

    $mail = (new ResetPassword('test-token'))->toMail($user);
    $html = (string) $mail->render();

    expect($mail->subject)->toBe('Redefinir senha');
    expect($html)
        ->toContain('Olá, Maria!')
        ->toContain('Redefinir senha')
        ->toContain('logo.png')
        ->toContain('#a67c62');
});
