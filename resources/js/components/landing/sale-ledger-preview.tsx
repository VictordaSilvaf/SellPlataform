import { SaleStatusBadge } from '@/components/sales/sale-status-badge';
import { formatMoney } from '@/lib/money';
import type { SaleStatus } from '@/types';

const rows: {
    customer: string;
    item: string;
    total: number;
    status: SaleStatus;
}[] = [
    {
        customer: 'Mesa 4',
        item: 'Pão de queijo + café',
        total: 1850,
        status: 'PAID',
    },
    {
        customer: 'Encomenda da Ana',
        item: 'Torta de limão',
        total: 7200,
        status: 'PENDING',
    },
    {
        customer: 'Balcão',
        item: 'Bolo de milho',
        total: 2800,
        status: 'CANCELLED',
    },
];

export function SaleLedgerPreview() {
    return (
        <figure className="relative mx-auto w-full max-w-md motion-safe:origin-bottom-right motion-safe:rotate-2">
            <div
                aria-hidden
                className="absolute -inset-6 rounded-[1.25rem] bg-primary/15 blur-2xl dark:bg-primary/25"
            />
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
                <div className="flex items-center justify-between gap-3 border-b border-border bg-primary px-5 py-4 text-primary-foreground">
                    <div>
                        <p className="text-sm font-medium">Padaria da Rua</p>
                        <p className="text-xs text-primary-foreground/80">
                            Hoje · 3 vendas
                        </p>
                    </div>
                    <p className="text-lg font-semibold tabular-nums">
                        {formatMoney(11850)}
                    </p>
                </div>
                <ul className="divide-y divide-border">
                    {rows.map((row) => (
                        <li
                            key={row.customer}
                            className="flex items-start justify-between gap-4 px-5 py-4"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-medium">
                                    {row.customer}
                                </p>
                                <p className="truncate text-sm text-muted-foreground">
                                    {row.item}
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                                <p className="text-sm font-medium tabular-nums">
                                    {formatMoney(row.total)}
                                </p>
                                <SaleStatusBadge status={row.status} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <figcaption className="sr-only">
                Exemplo de vendas do dia com status concluída, pendente e
                cancelada.
            </figcaption>
        </figure>
    );
}
