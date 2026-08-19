<?php

namespace App\Support;

class EnvName
{
    /**
     * Resolve a display name, ignoring empty values and uninterpolated ${VAR} placeholders.
     *
     * Docker env_file and some hosts pass MAIL_FROM_NAME=${APP_NAME} as a literal string.
     */
    public static function resolve(?string $value, string $fallback): string
    {
        if ($value === null || $value === '' || str_contains($value, '${')) {
            return $fallback;
        }

        return $value;
    }
}
