import { Head, Link, router, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { SaleStatusBadge } from '@/components/sales/sale-status-badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { cancel, create, index, pay, show } from '@/routes/workspace/sales';
import type { Paginated, Sale } from '@/types';

function stopRowNavigation(event: MouseEvent | KeyboardEvent): void {
    event.stopPropagation();
}

function SaleRowActions({
    sale,
    slug,
    canManage,
}: {
    sale: Sale;
    slug: string;
    canManage: boolean;
}) {
    if (!canManage || sale.status === 'CANCELLED') {
        return null;
    }

    const params = { workspace: slug, sale: sale.id };

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            {sale.status === 'PENDING' && (
                <Button
                    size="sm"
                    onClick={(event) => {
                        stopRowNavigation(event);
                        router.patch(pay.url(params));
                    }}
                >
                    Marcar pago
                </Button>
            )}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={stopRowNavigation}
                    >
                        Cancelar
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={stopRowNavigation}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Tem certeza que deseja cancelar esta venda?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            A venda #{sale.id} deixará de contar nos
                            indicadores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => router.patch(cancel.url(params))}
                        >
                            Cancelar venda
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function SalesIndex({
    sales,
    filters,
    canCreate,
}: {
    sales: Paginated<Sale>;
    filters: { search: string; status: string; from: string; to: string };
    canCreate: boolean;
}) {
    const { currentWorkspace, can } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';
    const canManage = can.manageSales;

    const openSale = (saleId: number): void => {
        router.visit(show.url({ workspace: slug, sale: saleId }));
    };

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
                                    {canManage && <TableHead className="text-right">Ações</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.data.map((sale) => (
                                    <TableRow
                                        key={sale.id}
                                        role="link"
                                        tabIndex={0}
                                        className="cursor-pointer"
                                        onClick={() => openSale(sale.id)}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === 'Enter' ||
                                                event.key === ' '
                                            ) {
                                                event.preventDefault();
                                                openSale(sale.id);
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <span className="font-medium">
                                                #{sale.id}
                                            </span>
                                            {sale.description && (
                                                <p className="mt-1 max-w-56 truncate text-xs text-muted-foreground">
                                                    {sale.description}
                                                </p>
                                            )}
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
                                        {canManage && (
                                            <TableCell
                                                className="text-right"
                                                onClick={stopRowNavigation}
                                            >
                                                <SaleRowActions
                                                    sale={sale}
                                                    slug={slug}
                                                    canManage={canManage}
                                                />
                                            </TableCell>
                                        )}
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
