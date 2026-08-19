<?php

use App\Enums\WorkspaceRole;
use App\Mail\NewUserWorkspaceInvitationMail;
use App\Models\User;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMember;
use App\Notifications\WorkspaceInvitationNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

test('an owner can invite an existing user', function () {
    Notification::fake();

    [$owner, $workspace] = userWithWorkspace();
    $invitee = User::factory()->create(['email' => 'maria@email.com']);

    $this->actingAs($owner)
        ->post(route('workspace.members.store', $workspace), [
            'email' => $invitee->email,
            'role' => WorkspaceRole::Member->value,
        ])
        ->assertRedirect();

    Notification::assertSentTo($invitee, WorkspaceInvitationNotification::class);

    expect(WorkspaceInvitation::query()->where('email', $invitee->email)->exists())->toBeTrue();
});

test('inviting an unknown email queues a registration mail', function () {
    Mail::fake();

    [$owner, $workspace] = userWithWorkspace();

    $this->actingAs($owner)
        ->post(route('workspace.members.store', $workspace), [
            'email' => 'joana@email.com',
            'role' => WorkspaceRole::Member->value,
        ])
        ->assertRedirect();

    Mail::assertQueued(NewUserWorkspaceInvitationMail::class);
});

test('a valid invitation can be accepted', function () {
    [$owner, $workspace] = userWithWorkspace();
    $invitee = User::factory()->create(['email' => 'maria@email.com']);

    $invitation = WorkspaceInvitation::factory()->create([
        'workspace_id' => $workspace->id,
        'invited_by' => $owner->id,
        'email' => $invitee->email,
        'role' => WorkspaceRole::Member,
    ]);

    $this->actingAs($invitee)
        ->post(route('invitations.accept'), ['token' => $invitation->token])
        ->assertRedirect(route('workspace.dashboard', $workspace));

    expect($invitee->isMemberOf($workspace))->toBeTrue()
        ->and($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('an invitation can be rejected', function () {
    [$owner, $workspace] = userWithWorkspace();
    $invitee = User::factory()->create(['email' => 'maria@email.com']);

    $invitation = WorkspaceInvitation::factory()->create([
        'workspace_id' => $workspace->id,
        'invited_by' => $owner->id,
        'email' => $invitee->email,
    ]);

    $this->actingAs($invitee)
        ->post(route('invitations.reject'), ['token' => $invitation->token])
        ->assertRedirect();

    expect($invitee->isMemberOf($workspace))->toBeFalse()
        ->and($invitation->fresh()->rejected_at)->not->toBeNull();
});

test('an expired invitation cannot be accepted', function () {
    [$owner, $workspace] = userWithWorkspace();
    $invitee = User::factory()->create(['email' => 'maria@email.com']);

    $invitation = WorkspaceInvitation::factory()->expired()->create([
        'workspace_id' => $workspace->id,
        'invited_by' => $owner->id,
        'email' => $invitee->email,
    ]);

    $this->actingAs($invitee)
        ->post(route('invitations.accept'), ['token' => $invitation->token])
        ->assertSessionHasErrors('invitation');
});

test('an invalid invitation token cannot be accepted', function () {
    $invitee = User::factory()->create();

    $this->actingAs($invitee)
        ->post(route('invitations.accept'), ['token' => str_repeat('a', 64)])
        ->assertSessionHasErrors('invitation');
});

test('an invitation token cannot be reused', function () {
    [$owner, $workspace] = userWithWorkspace();
    $invitee = User::factory()->create(['email' => 'maria@email.com']);

    $invitation = WorkspaceInvitation::factory()->create([
        'workspace_id' => $workspace->id,
        'invited_by' => $owner->id,
        'email' => $invitee->email,
    ]);

    $this->actingAs($invitee)
        ->post(route('invitations.accept'), ['token' => $invitation->token])
        ->assertRedirect();

    $this->actingAs($invitee)
        ->post(route('invitations.accept'), ['token' => $invitation->token])
        ->assertSessionHasErrors('invitation');
});

test('a user created through an invitation joins the workspace after verification', function () {
    [$owner, $workspace] = userWithWorkspace();

    $invitation = WorkspaceInvitation::factory()->create([
        'workspace_id' => $workspace->id,
        'invited_by' => $owner->id,
        'email' => 'joana@email.com',
        'role' => WorkspaceRole::Member,
    ]);

    $this->get(route('register', ['invitation' => $invitation->token]))->assertOk();

    $this->post(route('register.store'), [
        'name' => 'Joana',
        'email' => 'joana@email.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('verification.notice'));

    $user = User::query()->where('email', 'joana@email.com')->first();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)],
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->isMemberOf($workspace))->toBeTrue();
});

test('member limit includes the owner', function () {
    [$owner, $workspace] = userWithWorkspace();

    User::factory()->count(2)->create()->each(function (User $user) use ($workspace): void {
        WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceRole::Member,
        ]);
    });

    $this->actingAs($owner)
        ->post(route('workspace.members.store', $workspace), [
            'email' => 'extra@email.com',
            'role' => WorkspaceRole::Member->value,
        ])
        ->assertSessionHasErrors('email');
});
