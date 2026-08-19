<?php

namespace App\Http\Responses;

use App\Support\UserHome;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

class RegisterResponse implements RegisterResponseContract
{
    public function __construct(private UserHome $home) {}

    public function toResponse($request): Response
    {
        $user = $request->user();

        if ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail()) {
            return $request->wantsJson()
                ? new JsonResponse('', 201)
                : redirect()->route('verification.notice');
        }

        return $request->wantsJson()
            ? new JsonResponse('', 201)
            : redirect()->intended($this->home->url($user));
    }
}
