<?php

test('the landing page is the home screen', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});

test('the landing page highlights menus and the free plan limits', function () {
    $response = $this->get(route('home'));

    $response
        ->assertOk()
        ->assertSee('mynu', false)
        ->assertSee('Café da Esquina', false)
        ->assertSee('1 cardápio por ambiente', false)
        ->assertSee('Monte o cardápio', false);
});
