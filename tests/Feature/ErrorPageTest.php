<?php

use Illuminate\Support\Facades\Route;

test('unknown routes show a portuguese not found page', function () {
    $this->get('/pagina-que-nao-existe')
        ->assertNotFound()
        ->assertInertia(fn ($page) => $page
            ->component('errors/show')
            ->where('status', 404));
});

test('forbidden responses show a portuguese error page', function () {
    Route::middleware('web')->get('/__forbidden', fn () => abort(403));

    $this->get('/__forbidden')
        ->assertForbidden()
        ->assertInertia(fn ($page) => $page
            ->component('errors/show')
            ->where('status', 403));
});

test('server errors hide details from the customer when debug is off', function () {
    config(['app.debug' => false]);

    Route::middleware('web')->get('/__boom', function () {
        throw new RuntimeException('segredo interno');
    });

    $this->get('/__boom')
        ->assertStatus(500)
        ->assertDontSee('segredo interno')
        ->assertInertia(fn ($page) => $page
            ->component('errors/show')
            ->where('status', 500));
});
