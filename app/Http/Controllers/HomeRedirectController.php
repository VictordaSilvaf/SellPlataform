<?php

namespace App\Http\Controllers;

use App\Support\UserHome;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class HomeRedirectController extends Controller
{
    public function __invoke(Request $request, UserHome $home): RedirectResponse
    {
        return redirect()->to($home->url($request->user()));
    }
}
