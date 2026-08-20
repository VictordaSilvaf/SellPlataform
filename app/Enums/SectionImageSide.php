<?php

namespace App\Enums;

enum SectionImageSide: string
{
    case Left = 'LEFT';
    case Right = 'RIGHT';

    public function label(): string
    {
        return match ($this) {
            self::Left => 'Esquerda',
            self::Right => 'Direita',
        };
    }
}
