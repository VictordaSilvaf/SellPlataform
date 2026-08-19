<?php

namespace App\Enums;

enum WorkspaceRole: string
{
    case Owner = 'OWNER';
    case Admin = 'ADMIN';
    case Member = 'MEMBER';

    /**
     * @return list<self>
     */
    public static function assignable(): array
    {
        return [self::Admin, self::Member];
    }

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'Proprietário',
            self::Admin => 'Administrador',
            self::Member => 'Membro',
        };
    }

    public function canManageWorkspace(): bool
    {
        return $this === self::Owner;
    }

    public function canManageMembers(): bool
    {
        return in_array($this, [self::Owner, self::Admin], true);
    }

    public function canManageProducts(): bool
    {
        return in_array($this, [self::Owner, self::Admin], true);
    }

    public function canManageSales(): bool
    {
        return in_array($this, [self::Owner, self::Admin], true);
    }

    public function canCreateSales(): bool
    {
        return true;
    }

    public function canViewReports(): bool
    {
        return in_array($this, [self::Owner, self::Admin], true);
    }
}
