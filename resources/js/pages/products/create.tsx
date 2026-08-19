import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { ProductForm } from '@/components/products/product-form';
import { index, store } from '@/routes/workspace/products';

export default function ProductsCreate() {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';

    return (
        <>
            <Head title="Novo produto" />
            <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 md:px-8">
                <Heading title="Novo produto" />
                <ProductForm action={store.url(slug)} method="post">
                    <ProductForm.Fields />
                    <ProductForm.Pricing />
                    <ProductForm.Actions cancelHref={index.url(slug)} />
                </ProductForm>
            </div>
        </>
    );
}

ProductsCreate.layout = {
    breadcrumbs: [
        { title: 'Produtos', href: '#' },
        { title: 'Novo', href: '#' },
    ],
};
