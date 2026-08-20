<?php

use App\Models\User;
use App\Support\Auth\EmailVerificationCode;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

test('it issues a six digit verification code', function () {
    $user = User::factory()->unverified()->create();

    $code = EmailVerificationCode::issue($user);

    expect($code)->toMatch('/^\d{6}$/')
        ->and(Cache::has(EmailVerificationCode::cacheKey($user)))->toBeTrue()
        ->and(Hash::check($code, Cache::get(EmailVerificationCode::cacheKey($user))))->toBeTrue();
});

test('it verifies a valid code once', function () {
    $user = User::factory()->unverified()->create();
    $code = EmailVerificationCode::issue($user);

    expect(EmailVerificationCode::verify($user, $code))->toBeTrue()
        ->and(EmailVerificationCode::verify($user, $code))->toBeFalse()
        ->and(Cache::has(EmailVerificationCode::cacheKey($user)))->toBeFalse();
});

test('it rejects an invalid code', function () {
    $user = User::factory()->unverified()->create();
    EmailVerificationCode::issue($user);

    expect(EmailVerificationCode::verify($user, '000000'))->toBeFalse();
});
