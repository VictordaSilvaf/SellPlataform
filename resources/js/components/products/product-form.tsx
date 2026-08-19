import { Form, Link } from '@inertiajs/react';
import { createContext, useContext } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { centsFromReaisInput, formatMoney } from '@/lib/money';
import type { Product } from '@/types';

type ProductFormContextValue = {
    product?: Product;
    errors: Record<string, string>;
    processing: boolean;
};

const ProductFormContext = createContext<ProductFormContextValue | null>(null);

function useProductForm(): ProductFormContextValue {
    const context = useContext(ProductFormContext);

    if (!context) {
        throw new Error(
            'ProductForm components must be used within ProductForm',
        );
    }

    return context;
}

function ProductForm({
    action,
    method,
    product,
    children,
}: {
    action: string;
    method: 'post' | 'put';
    product?: Product;
    children: React.ReactNode;
}) {
    return (
        <Form
            action={action}
            method={method}
            transform={(data) => ({
                ...data,
                price: centsFromReaisInput(String(data.price ?? '')),
                active: data.active === 'on' || data.active === true,
            })}
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <ProductFormContext.Provider
                    value={{ product, errors, processing }}
                >
                    {children}
                </ProductFormContext.Provider>
            )}
        </Form>
    );
}

function Fields() {
    const { product, errors } = useProductForm();

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={product?.name}
                    placeholder="Camisa Preta"
                />
                <InputError message={errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                    id="description"
                    name="description"
                    defaultValue={product?.description ?? ''}
                    placeholder="Camisa preta tamanho M"
                    className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                <InputError message={errors.description} />
            </div>
        </div>
    );
}

function Pricing() {
    const { product, errors } = useProductForm();
    const defaultPrice = product
        ? formatMoney(product.price).replace('R$', '').trim()
        : '';

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                    id="price"
                    name="price"
                    required
                    defaultValue={defaultPrice}
                    placeholder="100,00"
                />
                <InputError message={errors.price} />
            </div>
            <div className="flex items-end gap-2 pb-2">
                <input
                    id="active"
                    name="active"
                    type="checkbox"
                    defaultChecked={product?.active ?? true}
                    className="size-4 rounded border"
                />
                <Label htmlFor="active">Ativo</Label>
            </div>
        </div>
    );
}

function Actions({ cancelHref }: { cancelHref: string }) {
    const { processing } = useProductForm();

    return (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" type="button" asChild>
                <Link href={cancelHref}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={processing}>
                {processing && <Spinner />}
                {processing ? 'Salvando...' : 'Salvar'}
            </Button>
        </div>
    );
}

ProductForm.Fields = Fields;
ProductForm.Pricing = Pricing;
ProductForm.Actions = Actions;

export { ProductForm };
