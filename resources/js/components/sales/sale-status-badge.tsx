import { CircleCheck, Clock3, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SaleStatus } from '@/types';

const statusConfig: Record<
    SaleStatus,
    {
        label: string;
        variant: 'success' | 'warning' | 'danger';
        icon: typeof CircleCheck;
    }
> = {
    PAID: { label: 'Concluída', variant: 'success', icon: CircleCheck },
    PENDING: { label: 'Pendente', variant: 'warning', icon: Clock3 },
    CANCELLED: { label: 'Cancelada', variant: 'danger', icon: XCircle },
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant={config.variant}>
            <Icon aria-hidden />
            <span>{config.label}</span>
        </Badge>
    );
}
