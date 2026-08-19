import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router, usePage } from '@inertiajs/react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { createContext, useContext, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import type {
    Control,
    FieldErrors,
    Resolver,
    UseFieldArrayAppend,
    UseFieldArrayRemove,
    UseFormRegister,
    UseFormSetValue,
} from 'react-hook-form';
import { z } from 'zod';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { formatMoney } from '@/lib/money';
import { store } from '@/routes/workspace/sales';

const saleSchema = z.object({
    items: z
        .array(
            z.object({
                product_id: z.coerce.number().min(1, 'Selecione um produto'),
                quantity: z.coerce.number().int().min(1, 'Quantidade inválida'),
            }),
        )
        .min(1, 'Adicione pelo menos um produto'),
    status: z.enum(['PAID', 'PENDING']),
});

type SaleFormValues = z.infer<typeof saleSchema>;

type CatalogProduct = {
    id: number;
    name: string;
    price: number;
};

type SaleFormContextValue = {
    products: CatalogProduct[];
    control: Control<SaleFormValues>;
    register: UseFormRegister<SaleFormValues>;
    errors: FieldErrors<SaleFormValues>;
    processing: boolean;
    fields: { id: string }[];
    append: UseFieldArrayAppend<SaleFormValues, 'items'>;
    remove: UseFieldArrayRemove;
    setValue: UseFormSetValue<SaleFormValues>;
    items: SaleFormValues['items'];
};

const SaleFormContext = createContext<SaleFormContextValue | null>(null);

function useSaleForm(): SaleFormContextValue {
    const context = useContext(SaleFormContext);

    if (!context) {
        throw new Error('SaleForm components must be used within SaleForm');
    }

    return context;
}

function SaleForm({
    products,
    children,
}: {
    products: CatalogProduct[];
    children: React.ReactNode;
}) {
    const { currentWorkspace } = usePage().props;
    const [processing, setProcessing] = useState(false);
    const form = useForm<SaleFormValues>({
        resolver: zodResolver(saleSchema) as Resolver<SaleFormValues>,
        defaultValues: {
            items: [{ product_id: products[0]?.id ?? 0, quantity: 1 }],
            status: 'PAID',
        },
    });
    const fieldArray = useFieldArray({ control: form.control, name: 'items' });
    const watchedItems = useWatch({ control: form.control, name: 'items' });

    const value = useMemo(
        () => ({
            products,
            control: form.control,
            register: form.register,
            errors: form.formState.errors,
            processing,
            fields: fieldArray.fields,
            append: fieldArray.append,
            remove: fieldArray.remove,
            setValue: form.setValue,
            items: watchedItems ?? [],
        }),
        [
            products,
            form.control,
            form.register,
            form.formState.errors,
            processing,
            fieldArray.fields,
            fieldArray.append,
            fieldArray.remove,
            form.setValue,
            watchedItems,
        ],
    );

    const onSubmit = form.handleSubmit((data) => {
        if (!currentWorkspace) {
            return;
        }

        router.post(store.url(currentWorkspace.slug), data, {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    });

    return (
        <SaleFormContext.Provider value={value}>
            <form onSubmit={onSubmit} className="space-y-8">
                {children}
            </form>
        </SaleFormContext.Provider>
    );
}

function Products() {
    const {
        products,
        fields,
        register,
        errors,
        append,
        remove,
        items,
        setValue,
    } = useSaleForm();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Produtos</h2>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        append({
                            product_id: products[0]?.id ?? 0,
                            quantity: 1,
                        })
                    }
                >
                    <Plus className="size-4" />
                    Adicionar produto
                </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-3 py-2 font-medium">Produto</th>
                            <th className="px-3 py-2 font-medium">Qtd.</th>
                            <th className="px-3 py-2 font-medium">Preço</th>
                            <th className="px-3 py-2 font-medium">Total</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, index) => {
                            const selected = products.find(
                                (product) =>
                                    product.id ===
                                    Number(items[index]?.product_id),
                            );
                            const quantity = Number(
                                items[index]?.quantity || 1,
                            );
                            const unitPrice = selected?.price ?? 0;

                            return (
                                <tr key={field.id} className="border-t">
                                    <td className="px-3 py-2">
                                        <select
                                            className="h-9 w-full min-w-40 rounded-md border bg-transparent px-2 text-sm"
                                            {...register(
                                                `items.${index}.product_id`,
                                            )}
                                        >
                                            {products.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={
                                                errors.items?.[index]
                                                    ?.product_id?.message
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    setValue(
                                                        `items.${index}.quantity`,
                                                        Math.max(
                                                            1,
                                                            quantity - 1,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Minus className="size-4" />
                                            </Button>
                                            <Input
                                                className="w-16 text-center"
                                                type="number"
                                                min={1}
                                                {...register(
                                                    `items.${index}.quantity`,
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    setValue(
                                                        `items.${index}.quantity`,
                                                        quantity + 1,
                                                    )
                                                }
                                            >
                                                <Plus className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        {formatMoney(unitPrice)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {formatMoney(unitPrice * quantity)}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                            aria-label="Remover produto"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {errors.items?.message && (
                <InputError message={errors.items.message} />
            )}
        </div>
    );
}

function Payment() {
    const { control } = useSaleForm();

    return (
        <fieldset className="space-y-3">
            <legend className="text-base font-semibold">Pagamento</legend>
            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-row items-center gap-2"
                    >
                        <div className="flex items-center gap-2 rounded-md border px-6 py-4">
                            <RadioGroupItem value="PAID" id="status-paid" />
                            <Label htmlFor="status-paid">Pago</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border px-6 py-4">
                            <RadioGroupItem
                                value="PENDING"
                                id="status-pending"
                            />
                            <Label htmlFor="status-pending">Pendente</Label>
                        </div>
                    </RadioGroup>
                )}
            />
        </fieldset>
    );
}

function Summary() {
    const { products, items } = useSaleForm();
    const total = items.reduce((sum, item) => {
        const product = products.find(
            (entry) => entry.id === Number(item.product_id),
        );

        return sum + (product?.price ?? 0) * Number(item.quantity || 0);
    }, 0);

    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-semibold">{formatMoney(total)}</span>
        </div>
    );
}

function Actions({ cancelHref }: { cancelHref: string }) {
    const { processing } = useSaleForm();

    return (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" type="button" asChild>
                <Link href={cancelHref}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={processing}>
                {processing && <Spinner />}
                {processing ? 'Salvando...' : 'Registrar venda'}
            </Button>
        </div>
    );
}

SaleForm.Products = Products;
SaleForm.Payment = Payment;
SaleForm.Summary = Summary;
SaleForm.Actions = Actions;

export { SaleForm };
