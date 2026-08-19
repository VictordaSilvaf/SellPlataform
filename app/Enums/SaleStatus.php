<?php

namespace App\Enums;

enum SaleStatus: string
{
    case Paid = 'PAID';
    case Pending = 'PENDING';
    case Cancelled = 'CANCELLED';

    public function label(): string
    {
        return match ($this) {
            self::Paid => 'Pago',
            self::Pending => 'Pendente',
            self::Cancelled => 'Cancelado',
        };
    }
}
