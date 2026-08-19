<?php

test('rabbitmq is registered as a queue connection', function () {
    expect(config('queue.connections.rabbitmq.driver'))->toBe('rabbitmq');
    expect(config('queue.connections.rabbitmq.after_commit'))->toBeTrue();
    expect(config('queue.connections.rabbitmq.queue'))->toBe('default');
});

test('tests run with the sync queue driver', function () {
    expect(config('queue.default'))->toBe('sync');
});
