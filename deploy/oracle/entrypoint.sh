#!/usr/bin/env bash
set -euo pipefail

mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache

if [[ "${RUN_BOOTSTRAP:-false}" == "true" ]]; then
    until php -r "
        try {
            new PDO(
                sprintf('pgsql:host=%s;port=%s;dbname=%s', getenv('DB_HOST'), getenv('DB_PORT') ?: '5432', getenv('DB_DATABASE')),
                getenv('DB_USERNAME'),
                getenv('DB_PASSWORD')
            );
            exit(0);
        } catch (Throwable \$e) {
            exit(1);
        }
    "; do
        echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT:-5432}..."
        sleep 2
    done

    gosu www-data php artisan storage:link --force --no-interaction
    gosu www-data php artisan migrate --force --no-interaction
    gosu www-data php artisan config:cache --no-interaction
    gosu www-data php artisan route:cache --no-interaction
    gosu www-data php artisan view:cache --no-interaction
    gosu www-data php artisan event:cache --no-interaction
    touch /tmp/app-ready
fi

if [[ "${1:-}" == "php-fpm" ]]; then
    exec "$@"
fi

exec gosu www-data "$@"
