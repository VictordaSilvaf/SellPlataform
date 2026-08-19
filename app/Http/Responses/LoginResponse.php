<?php

namespace App\Http\Responses;

use App\Support\UserHome;
use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function __construct(private UserHome $home) {}

    public function toResponse($request): Response
    {
        $url = $this->home->url($request->user());

        return $request->wantsJson()
            ? new JsonResponse(['two_factor' => false], 200)
            : redirect()->intended($url);
    }
}
