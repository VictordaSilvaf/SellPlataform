#!/usr/bin/env bash
set -euo pipefail

export PORT="${PORT:-10000}"

if [[ -z "${APP_URL:-}" && -n "${RENDER_EXTERNAL_URL:-}" ]]; then
    export APP_URL="${RENDER_EXTERNAL_URL}"
fi

mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache

wait_for_postgres() {
    until php -r '
        $url = getenv("DB_URL");
        if (is_string($url) && $url !== "") {
            $parts = parse_url($url);
            if ($parts === false || ! isset($parts["host"])) {
                fwrite(STDERR, "DB_URL is invalid.\n");
                exit(1);
            }
            $dsn = sprintf(
                "pgsql:host=%s;port=%s;dbname=%s",
                $parts["host"],
                $parts["port"] ?? "5432",
                ltrim($parts["path"] ?? "", "/")
            );
            $user = rawurldecode($parts["user"] ?? "");
            $password = rawurldecode($parts["pass"] ?? "");
        } else {
            $dsn = sprintf(
                "pgsql:host=%s;port=%s;dbname=%s",
                getenv("DB_HOST"),
                getenv("DB_PORT") ?: "5432",
                getenv("DB_DATABASE")
            );
            $user = getenv("DB_USERNAME") ?: "";
            $password = getenv("DB_PASSWORD") ?: "";
        }

        try {
            new PDO($dsn, $user, $password);
            exit(0);
        } catch (Throwable $e) {
            exit(1);
        }
    '; do
        echo "Waiting for Postgres..."
        sleep 2
    done
}

bootstrap_app() {
    wait_for_postgres
    gosu www-data php artisan storage:link --force --no-interaction
    gosu www-data php artisan migrate --force --no-interaction
    gosu www-data php artisan config:cache --no-interaction
    gosu www-data php artisan route:cache --no-interaction
    gosu www-data php artisan view:cache --no-interaction
    gosu www-data php artisan event:cache --no-interaction
}

role="${1:-web}"

if [[ "${role}" == "web" || "${RUN_BOOTSTRAP:-false}" == "true" ]]; then
    bootstrap_app
    envsubst '${PORT}' < /etc/nginx/templates/default.conf.template \
        > /etc/nginx/sites-available/default
    exec /usr/bin/supervisord -c /etc/supervisor/conf.d/laravel.conf
fi

if [[ "${role}" == "queue" ]]; then
    exec gosu www-data php artisan queue:work redis --sleep=1 --tries=3 --timeout=90
fi

if [[ "${role}" == "scheduler" ]]; then
    exec gosu www-data php artisan schedule:work
fi

exec gosu www-data "$@"
