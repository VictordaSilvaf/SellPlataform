<?php

namespace App\Support\Images;

enum ImageVariant: string
{
    case ProductMain = 'product_main';
    case Logo = 'logo';
    case Cover = 'cover';
    case MenuBanner = 'menu_banner';
    case MenuSection = 'menu_section';

    public function pathFor(int $id): string
    {
        return match ($this) {
            self::ProductMain => "products/{$id}/main.webp",
            self::Logo => "workspaces/{$id}/logo.webp",
            self::Cover => "workspaces/{$id}/cover.webp",
            self::MenuBanner => "menus/{$id}/banner.webp",
            self::MenuSection => "menu-sections/{$id}/image.webp",
        };
    }

    /**
     * @return array{max_width: int, max_height: int, mode: string}
     */
    public function settings(): array
    {
        /** @var array{max_width: int, max_height: int, mode: string} $settings */
        $settings = config('images.variants.'.$this->value);

        return $settings;
    }
}
