import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { ProductForm } from '@/components/products/product-form';
import { index, update } from '@/routes/workspace/products';
import type { Product } from '@/types';

export default function ProductsEdit({ product }: { product: Product }) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';

    return (
        <>
            <Head title="Editar produto" />
            <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 md:px-8">
                <Heading title="Editar produto" />
                <ProductForm
                    action={update.url({
                        workspace: slug,
                        product: product.id,
                    })}
                    method="put"
                    product={product}
                >
                    <ProductForm.Fields />
                    <ProductForm.Pricing />
                    <ProductForm.Actions cancelHref={index.url(slug)} />
                </ProductForm>
            </div>
        </>
    );
}

ProductsEdit.layout = {
    breadcrumbs: [
        { title: 'Produtos', href: '#' },
        { title: 'Editar', href: '#' },
    ],
};
