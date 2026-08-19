<?php

test('the design system defines light and dark pastel tokens', function () {
    $css = file_get_contents(resource_path('css/app.css'));

    expect($css)
        ->toContain('--background: #f3ebe5')
        ->toContain('--primary: #a67c62')
        ->toContain('--surface: #ffffff')
        ->and($css)
        ->toContain('--background: #1c1815')
        ->toContain('--primary: #c09a7d')
        ->toContain("'Inter'");
});

test('the application uses the custom logo mark', function () {
    expect(file_get_contents(resource_path('js/components/app-logo-icon.tsx')))
        ->toContain('/logo.png')
        ->and(file_exists(public_path('logo.png')))
        ->toBeTrue();

    $this->get(route('home'))
        ->assertOk()
        ->assertSee('/logo.png', false);
});

test('the apple touch icon is published at the canonical path', function () {
    expect(file_exists(public_path('apple-touch-icon.png')))->toBeTrue();
    expect(file_exists(public_path('apple-touch-icon copy.png')))->toBeFalse();

    $this->get(route('home'))
        ->assertOk()
        ->assertSee('/apple-touch-icon.png', false)
        ->assertDontSee('apple-touch-icon copy', false);
});
