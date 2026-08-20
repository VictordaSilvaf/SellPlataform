import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { SaleForm } from '@/components/sales/sale-form';
import { index } from '@/routes/workspace/sales';

type CatalogProduct = {
    id: number;
    name: string;
    price: number;
};

export default function SalesCreate({
    products,
}: {
    products: CatalogProduct[];
}) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';

    return (
        <>
            <Head title="Nova venda" />
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:px-8">
                <Heading title="Nova venda" />
                {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Cadastre um produto ativo antes de registrar vendas.
                    </p>
                ) : (
                    <SaleForm products={products}>
                        <SaleForm.Products />
                        <SaleForm.Notes />
                        <SaleForm.Payment />
                        <SaleForm.Summary />
                        <SaleForm.Actions cancelHref={index.url(slug)} />
                    </SaleForm>
                )}
            </div>
        </>
    );
}

SalesCreate.layout = {
    breadcrumbs: [
        { title: 'Vendas', href: '#' },
        { title: 'Nova', href: '#' },
    ],
};
