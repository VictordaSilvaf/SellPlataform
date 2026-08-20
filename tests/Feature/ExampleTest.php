<?php

test('the landing page is the home screen', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});

test('the landing page shares the application name through inertia', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->where('name', 'mynu'));
});

test('the welcome screen highlights menus and the free plan limits', function () {
    $welcome = file_get_contents(resource_path('js/pages/welcome.tsx'));
    $preview = file_get_contents(resource_path('js/components/landing/menu-preview.tsx'));

    expect($welcome)
        ->toContain('1 cardápio')
        ->toContain('por ambiente')
        ->toContain('Monte o cardápio');

    expect($preview)->toContain('Café da Esquina');
});
