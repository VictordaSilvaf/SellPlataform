# syntax=docker/dockerfile:1

FROM php:8.5-fpm-bookworm AS php-base

COPY --from=mlocati/php-extension-installer:2 /usr/bin/install-php-extensions /usr/local/bin/

RUN apt-get update \
    && apt-get install -y --no-install-recommends gosu \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions \
        pdo_pgsql \
        redis \
        pcntl \
        sockets \
        intl \
        bcmath \
        zip \
        gd \
        opcache

COPY deploy/oracle/php.ini /usr/local/etc/php/conf.d/zz-production.ini
COPY deploy/oracle/zz-php-fpm.conf /usr/local/etc/php-fpm.d/zz-oracle.conf

FROM php-base AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=node:22-bookworm /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node:22-bookworm /usr/local/bin/node /usr/local/bin/node
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /var/www/html

ENV APP_ENV=production \
    APP_DEBUG=false \
    APP_KEY=base64:2fl+3NFDNWiZ4hH9M9jQx2YqK1vQe8pL0aBcDeFgHiI= \
    LOG_CHANNEL=stderr

COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN composer dump-autoload --optimize --no-dev --no-interaction \
    && php artisan package:discover --ansi \
    && php artisan wayfinder:generate --with-form \
    && npm run build \
    && rm -rf node_modules

FROM php-base AS app

WORKDIR /var/www/html

COPY --from=build --chown=www-data:www-data /var/www/html /var/www/html
COPY --chmod=755 deploy/oracle/entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]

FROM caddy:2-alpine AS caddy

COPY --from=build /var/www/html/public /var/www/html/public
COPY deploy/oracle/Caddyfile /etc/caddy/Caddyfile
COPY deploy/oracle/sites /etc/caddy/sites
