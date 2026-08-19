<?php

namespace App\Enums;

enum MenuStatus: string
{
    case Draft = 'DRAFT';
    case Active = 'ACTIVE';
    case Inactive = 'INACTIVE';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Rascunho',
            self::Active => 'Ativo',
            self::Inactive => 'Inativo',
        };
    }
}
