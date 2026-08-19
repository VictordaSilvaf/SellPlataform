import { Head, Link, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/money';
import { cancel, index, pay } from '@/routes/workspace/sales';
import type { Sale } from '@/types';

const statusLabel: Record<Sale['status'], string> = {
    PAID: 'Pago',
    PENDING: 'Pendente',
    CANCELLED: 'Cancelado',
};

export default function SalesShow({
    sale,
    canUpdatePayment,
    canCancel,
}: {
    sale: Sale;
    canUpdatePayment: boolean;
    canCancel: boolean;
}) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';

    return (
        <>
            <Head title={`Venda #${sale.id}`} />
            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title={`Venda #${sale.id}`} />
                    <Button variant="outline" asChild>
                        <Link href={index(slug)}>Voltar</Link>
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Data: {new Date(sale.sold_at).toLocaleDateString('pt-BR')}
                </p>
                <div className="rounded-lg border">
                    {sale.items?.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                        >
                            <div>
                                <p className="font-medium">
                                    {item.quantity}x {item.product?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatMoney(item.unit_price)}
                                </p>
                            </div>
                            <p>{formatMoney(item.total)}</p>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatMoney(sale.total)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span>Pagamento:</span>
                    <Badge>{statusLabel[sale.status]}</Badge>
                    {sale.status === 'PENDING' && canUpdatePayment && (
                        <Button
                            onClick={() =>
                                router.patch(
                                    pay.url({ workspace: slug, sale: sale.id }),
                                )
                            }
                        >
                            Marcar como pago
                        </Button>
                    )}
                    {sale.status !== 'CANCELLED' && canCancel && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    Cancelar venda
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Tem certeza que deseja cancelar esta
                                        venda?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        A venda deixará de contar nos
                                        indicadores.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Voltar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() =>
                                            router.patch(
                                                cancel.url({
                                                    workspace: slug,
                                                    sale: sale.id,
                                                }),
                                            )
                                        }
                                    >
                                        Cancelar venda
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        </>
    );
}

SalesShow.layout = {
    breadcrumbs: [
        { title: 'Vendas', href: '#' },
        { title: 'Detalhes', href: '#' },
    ],
};
