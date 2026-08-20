<?php

use App\Support\EnvName;

test('it keeps a concrete application name', function () {
    expect(EnvName::resolve('mynu', 'Laravel'))->toBe('mynu');
});

test('it ignores uninterpolated env placeholders', function () {
    expect(EnvName::resolve('${APP_NAME}', 'mynu'))->toBe('mynu');
});

test('it falls back when the value is empty', function () {
    expect(EnvName::resolve('', 'mynu'))->toBe('mynu')
        ->and(EnvName::resolve(null, 'mynu'))->toBe('mynu');
});
