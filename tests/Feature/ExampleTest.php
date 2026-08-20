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

    $welcomeCopy = preg_replace('/\s+/', ' ', $welcome) ?? $welcome;

    expect($welcomeCopy)
        ->toContain('1 cardápio por ambiente')
        ->toContain('Monte o cardápio');

    expect($preview)->toContain('Café da Esquina');
});

test('the landing page ships scroll, parallax and carousel components', function () {
    expect(file_exists(resource_path('js/components/landing/reveal.tsx')))->toBeTrue();
    expect(file_exists(resource_path('js/components/landing/parallax.tsx')))->toBeTrue();
    expect(file_exists(resource_path('js/components/landing/marquee.tsx')))->toBeTrue();
    expect(file_exists(resource_path('js/components/landing/showcase-carousel.tsx')))->toBeTrue();
    expect(file_exists(resource_path('js/components/landing/screens-carousel.tsx')))->toBeTrue();

    $welcome = file_get_contents(resource_path('js/pages/welcome.tsx'));

    expect($welcome)
        ->toContain('Reveal')
        ->toContain('Parallax')
        ->toContain('VenueMarquee')
        ->toContain('ShowcaseCarousel')
        ->toContain('ScreensCarousel');
});
