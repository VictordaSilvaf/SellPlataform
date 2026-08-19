import { Head, Link, router, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { SaleStatusBadge } from '@/components/sales/sale-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatMoney } from '@/lib/money';
import { create, index, show } from '@/routes/workspace/sales';
import type { Paginated, Sale } from '@/types';

export default function SalesIndex({
    sales,
    filters,
    canCreate,
}: {
    sales: Paginated<Sale>;
    filters: { search: string; status: string; from: string; to: string };
    canCreate: boolean;
}) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';

    return (
        <>
            <Head title="Vendas" />
            <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Vendas"
                        description="Histórico de vendas deste ambiente."
                    />
                    {canCreate && (
                        <Button asChild>
                            <Link href={create(slug)}>Registrar venda</Link>
                        </Button>
                    )}
                </div>
                <form
                    className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        router.get(index.url(slug), {
                            search: String(form.get('search') ?? ''),
                            status: String(form.get('status') ?? ''),
                            from: String(form.get('from') ?? ''),
                            to: String(form.get('to') ?? ''),
                        });
                    }}
                >
                    <Input
                        name="search"
                        placeholder="Buscar"
                        defaultValue={filters.search}
                    />
                    <select
                        name="status"
                        defaultValue={filters.status}
                        className="h-9 rounded-md border border-border bg-card px-3 text-sm"
                    >
                        <option value="">Todos</option>
                        <option value="PAID">Pago</option>
                        <option value="PENDING">Pendente</option>
                        <option value="CANCELLED">Cancelado</option>
                    </select>
                    <Input
                        name="from"
                        type="date"
                        defaultValue={filters.from}
                    />
                    <Input name="to" type="date" defaultValue={filters.to} />
                    <Button type="submit" variant="outline">
                        Filtrar
                    </Button>
                </form>
                {sales.data.length === 0 ? (
                    <EmptyState
                        icon={ShoppingCart}
                        title="Nenhuma venda registrada."
                        description="Registre sua primeira venda para começar."
                        actionLabel={canCreate ? 'Registrar venda' : undefined}
                        actionHref={canCreate ? create.url(slug) : undefined}
                    />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Venda</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Itens</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.data.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            <Link
                                                href={show.url({
                                                    workspace: slug,
                                                    sale: sale.id,
                                                })}
                                                className="font-medium underline-offset-4 hover:underline"
                                            >
                                                #{sale.id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                sale.sold_at,
                                            ).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell>
                                            {sale.items?.length ?? 0} itens
                                        </TableCell>
                                        <TableCell>
                                            {formatMoney(sale.total)}
                                        </TableCell>
                                        <TableCell>
                                            <SaleStatusBadge
                                                status={sale.status}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Pagination meta={sales} />
                    </>
                )}
            </div>
        </>
    );
}

SalesIndex.layout = {
    breadcrumbs: [{ title: 'Vendas', href: '#' }],
};
