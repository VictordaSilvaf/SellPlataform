<?php

test('the render blueprint uses docker, redis queues, and postgres url', function () {
    $blueprint = file_get_contents(base_path('render.yaml'));

    expect($blueprint)
        ->toContain('dockerfilePath: ./deploy/render/Dockerfile')
        ->toContain('dockerCommand: web')
        ->toContain('dockerCommand: queue')
        ->toContain('healthCheckPath: /up')
        ->toContain('key: DB_URL')
        ->toContain('key: QUEUE_CONNECTION')
        ->toContain('key: MAIL_FROM_NAME')
        ->toContain('value: mynu')
        ->toContain('value: redis')
        ->toContain('sellplataform-kv');
});

test('the render web process listens on the platform port', function () {
    $entrypoint = file_get_contents(base_path('deploy/render/entrypoint.sh'));
    $nginx = file_get_contents(base_path('deploy/render/nginx.conf.template'));
    $dockerfile = file_get_contents(base_path('deploy/render/Dockerfile'));

    expect($entrypoint)
        ->toContain('PORT:-10000')
        ->toContain('queue:work redis')
        ->and($nginx)
        ->toContain('listen ${PORT}')
        ->and($dockerfile)
        ->toContain('CMD ["web"]');
});

test('the application trusts reverse proxies', function () {
    expect(file_get_contents(base_path('bootstrap/app.php')))
        ->toContain("trustProxies(at: '*')");
});

test('the health endpoint remains available', function () {
    $this->get('/up')->assertOk();
});

test('the application display name is mynu', function () {
    expect(config('app.name'))->toBe('mynu')
        ->and(config('mail.from.name'))->toBe('mynu');
});
