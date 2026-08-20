<?php

namespace App\Support\Auth;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class EmailVerificationCode
{
    public const LENGTH = 6;

    public const TTL_MINUTES = 60;

    public static function issue(Authenticatable $user): string
    {
        $code = (string) random_int(10 ** (self::LENGTH - 1), (10 ** self::LENGTH) - 1);

        Cache::put(
            self::cacheKey($user),
            Hash::make($code),
            now()->addMinutes(self::TTL_MINUTES),
        );

        return $code;
    }

    public static function verify(Authenticatable $user, string $code): bool
    {
        $hashed = Cache::get(self::cacheKey($user));

        if (! is_string($hashed) || ! Hash::check($code, $hashed)) {
            return false;
        }

        Cache::forget(self::cacheKey($user));

        return true;
    }

    public static function cacheKey(Authenticatable $user): string
    {
        return 'email-verification-code:'.$user->getAuthIdentifier();
    }
}
