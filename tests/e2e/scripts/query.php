<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\WorkspaceInvitation;
use App\Support\Auth\EmailVerificationCode;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\URL;

require __DIR__.'/../../../vendor/autoload.php';

$app = require __DIR__.'/../../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

URL::forceRootUrl(env('PLAYWRIGHT_BASE_URL', 'http://127.0.0.1:8000'));

$action = $argv[1] ?? '';
$value = $argv[2] ?? '';

match ($action) {
    'verification-code' => (static function () use ($value): void {
        $user = User::query()->where('email', $value)->firstOrFail();

        echo EmailVerificationCode::issue($user);
    })(),
    'invitation-token' => (static function () use ($value): void {
        echo (string) WorkspaceInvitation::query()
            ->where('email', $value)
            ->latest()
            ->value('token');
    })(),
    default => throw new InvalidArgumentException("Unknown action [{$action}]."),
};
