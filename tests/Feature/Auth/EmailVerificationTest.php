<?php

use App\Models\User;
use App\Support\Auth\EmailVerificationCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::emailVerification());
});

test('email verification screen can be rendered', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get(route('verification.notice'));

    $response->assertOk();
});

test('email can be verified with a valid code', function () {
    $user = User::factory()->unverified()->create();

    Event::fake();

    $code = EmailVerificationCode::issue($user);

    $response = $this->actingAs($user)->post(route('verification.verify-code'), [
        'code' => $code,
    ]);

    Event::assertDispatched(Verified::class);

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
});

test('email is not verified with an invalid code', function () {
    $user = User::factory()->unverified()->create();

    Event::fake();

    EmailVerificationCode::issue($user);

    $this->actingAs($user)->post(route('verification.verify-code'), [
        'code' => '000000',
    ])->assertSessionHasErrors('code');

    Event::assertNotDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('verified user is redirected to dashboard from verification prompt', function () {
    $user = User::factory()->create();

    Event::fake();

    $response = $this->actingAs($user)->get(route('verification.notice'));

    Event::assertNotDispatched(Verified::class);
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('already verified user submitting a code is redirected without firing event again', function () {
    $user = User::factory()->create();

    Event::fake();

    $this->actingAs($user)->post(route('verification.verify-code'), [
        'code' => '123456',
    ])->assertRedirect(route('dashboard', absolute: false).'?verified=1');

    Event::assertNotDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('verification emails contain a code instead of a link button', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $user->sendEmailVerificationNotification();

    Notification::assertSentTo($user, VerifyEmail::class, function (VerifyEmail $notification) use ($user): bool {
        $mail = $notification->toMail($user);
        $html = (string) $mail->render();

        expect($mail->actionUrl ?? null)->toBeNull()
            ->and($html)->toMatch('/\b\d{6}\b/')
            ->and($html)->not->toContain('Confirmar e-mail');

        return true;
    });
});
