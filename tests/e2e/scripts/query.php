<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\URL;

require __DIR__.'/../../../vendor/autoload.php';

$app = require __DIR__.'/../../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

URL::forceRootUrl(env('PLAYWRIGHT_BASE_URL', 'http://127.0.0.1:8000'));

$action = $argv[1] ?? '';
$value = $argv[2] ?? '';

match ($action) {
    'verification-url' => (static function () use ($value): void {
        $user = User::query()->where('email', $value)->firstOrFail();

        echo URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );
    })(),
    'invitation-token' => (static function () use ($value): void {
        echo (string) WorkspaceInvitation::query()
            ->where('email', $value)
            ->latest()
            ->value('token');
    })(),
    default => throw new InvalidArgumentException("Unknown action [{$action}]."),
};
