import { Head, Link, usePage } from '@inertiajs/react';
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { formatMoney } from '@/lib/money';
import { dashboard } from '@/routes/workspace';
import { index as salesIndex, show } from '@/routes/workspace/sales';
import type { Sale } from '@/types';

type Metrics = {
    today_total: number;
    month_total: number;
    received_total: number;
    pending_total: number;
    sales_count: number;
};

type ChartPoint = {
    date: string;
    label: string;
    total: number;
};

export default function DashboardIndex({
    metrics,
    chart,
    recentSales,
    period,
}: {
    metrics: Metrics;
    chart: ChartPoint[];
    recentSales: Sale[];
    period: string;
}) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';

    const cards = [
        { title: 'Vendas hoje', value: formatMoney(metrics.today_total) },
        { title: 'Vendas do mês', value: formatMoney(metrics.month_total) },
        { title: 'Total recebido', value: formatMoney(metrics.received_total) },
        { title: 'Total pendente', value: formatMoney(metrics.pending_total) },
        { title: 'Quantidade de vendas', value: String(metrics.sales_count) },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <Heading
                    title="Dashboard"
                    description="Acompanhe os indicadores deste ambiente."
                />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {cards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-semibold">
                                {card.value}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Faturamento</CardTitle>
                        <div className="flex gap-2">
                            {['7', '30', '90', 'year'].map((value) => (
                                <Button
                                    key={value}
                                    size="sm"
                                    variant={
                                        period === value ? 'default' : 'outline'
                                    }
                                    asChild
                                >
                                    <Link
                                        href={dashboard.url(slug, {
                                            query: { period: value },
                                        })}
                                    >
                                        {value === 'year' ? 'Ano' : `${value}d`}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="h-64">
                        {chart.every((point) => point.total === 0) ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                Ainda não há faturamento neste período.
                            </div>
                        ) : (
                            <ChartContainer>
                                <BarChart data={chart}>
                                    <XAxis dataKey="label" fontSize={12} />
                                    <YAxis
                                        fontSize={12}
                                        tickFormatter={(value) =>
                                            formatMoney(Number(value))
                                        }
                                    />
                                    <Tooltip
                                        formatter={(value) =>
                                            formatMoney(Number(value ?? 0))
                                        }
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="var(--color-primary)"
                                        radius={4}
                                    />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Vendas recentes</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={salesIndex(slug)}>Ver todas</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentSales.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Nenhuma venda recente.
                            </p>
                        )}
                        {recentSales.map((sale) => (
                            <Link
                                key={sale.id}
                                href={show.url({
                                    workspace: slug,
                                    sale: sale.id,
                                })}
                                className="flex items-center justify-between rounded-md border px-3 py-2"
                            >
                                <div>
                                    <p className="font-medium">#{sale.id}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {sale.items
                                            ?.map((item) => item.product?.name)
                                            .filter(Boolean)
                                            .join(' + ') || 'Itens'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p>{formatMoney(sale.total)}</p>
                                    <Badge variant="secondary">
                                        {sale.status === 'PAID'
                                            ? 'Pago'
                                            : sale.status === 'PENDING'
                                              ? 'Pendente'
                                              : 'Cancelado'}
                                    </Badge>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DashboardIndex.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '#' }],
};
