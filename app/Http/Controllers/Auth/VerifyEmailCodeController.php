<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyEmailCodeRequest;
use App\Support\Auth\EmailVerificationCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Features;

class VerifyEmailCodeController extends Controller
{
    public function __invoke(VerifyEmailCodeRequest $request): RedirectResponse
    {
        abort_unless(Features::enabled(Features::emailVerification()), 404);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        if (! EmailVerificationCode::verify($user, $request->string('code')->toString())) {
            throw ValidationException::withMessages([
                'code' => 'Código inválido ou expirado. Solicite um novo e-mail de verificação.',
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
}
