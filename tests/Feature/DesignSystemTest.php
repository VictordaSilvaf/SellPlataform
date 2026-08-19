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
