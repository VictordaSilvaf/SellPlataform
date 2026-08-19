<?php

use App\Support\EnvName;

test('it keeps a concrete application name', function () {
    expect(EnvName::resolve('SellPlataform', 'Laravel'))->toBe('SellPlataform');
});

test('it ignores uninterpolated env placeholders', function () {
    expect(EnvName::resolve('${APP_NAME}', 'SellPlataform'))->toBe('SellPlataform');
});

test('it falls back when the value is empty', function () {
    expect(EnvName::resolve('', 'SellPlataform'))->toBe('SellPlataform')
        ->and(EnvName::resolve(null, 'SellPlataform'))->toBe('SellPlataform');
});
