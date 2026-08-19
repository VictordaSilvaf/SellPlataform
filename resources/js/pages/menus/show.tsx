import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { MenuQrDialog } from '@/components/menus/menu-qr-dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import { destroy, index, update } from '@/routes/workspace/menus';
import {
    destroy as removeProduct,
    order,
    store as addProducts,
    toggle,
} from '@/routes/workspace/menus/products';
import type { MenuProductItem, MenuStatus, Product } from '@/types';

type MenuShowProps = {
    menu: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        status: MenuStatus;
        public_url: string;
    };
    items: MenuProductItem[];
    availableProducts: Pick<Product, 'id' | 'name' | 'price' | 'active'>[];
    statuses: { value: MenuStatus; label: string }[];
    canManage: boolean;
};

export default function MenusShow({
    menu,
    items,
    availableProducts,
    statuses,
    canManage,
}: MenuShowProps) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const params = { workspace: slug, menu: menu.id };

    function toggleAvailability(item: MenuProductItem): void {
        const next = !item.active;

        router
            .optimistic((props: MenuShowProps) => ({
                items: props.items.map((row) =>
                    row.product_id === item.product_id
                        ? { ...row, active: next }
                        : row,
                ),
            }))
            .patch(
                toggle.url({ ...params, product: item.product_id }),
                { active: next },
                {
                    preserveScroll: true,
                    onError: () =>
                        toast.error('Não foi possível atualizar o produto.'),
                },
            );
    }

    function handleDragEnd(event: DragEndEvent): void {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = items.findIndex(
            (item) => item.product_id === active.id,
        );
        const newIndex = items.findIndex((item) => item.product_id === over.id);

        if (oldIndex < 0 || newIndex < 0) {
            return;
        }

        const next = arrayMove(items, oldIndex, newIndex);

        router
            .optimistic(() => ({ items: next }))
            .patch(
                order.url(params),
                { product_ids: next.map((item) => item.product_id) },
                {
                    preserveScroll: true,
                    onError: () =>
                        toast.error('Não foi possível reordenar os produtos.'),
                },
            );
    }

    function submitSelectedProducts(): void {
        if (selectedIds.length === 0) {
            return;
        }

        router.post(
            addProducts.url(params),
            { product_ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setDialogOpen(false);
                },
            },
        );
    }

    return (
        <>
            <Head title={menu.name} />
            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={menu.name}
                        description="Ative, inative e organize os produtos deste cardápio."
                    />
                    <div className="flex flex-wrap gap-2">
                        <MenuQrDialog
                            name={menu.name}
                            publicUrl={menu.public_url}
                            slug={menu.slug}
                            trigger={
                                <Button variant="outline">Ver QR Code</Button>
                            }
                        />
                        <Button variant="outline" asChild>
                            <Link href={index.url(slug)}>Voltar</Link>
                        </Button>
                    </div>
                </div>

                <p className="text-sm break-all text-muted-foreground">
                    {menu.public_url}
                </p>

                {canManage && menu.status === 'DRAFT' && (
                    <Button
                        onClick={() =>
                            router.put(
                                update.url(params),
                                {
                                    name: menu.name,
                                    description: menu.description,
                                    status: 'ACTIVE',
                                },
                                { preserveScroll: true },
                            )
                        }
                    >
                        Publicar
                    </Button>
                )}

                {canManage && (
                    <Form
                        action={update.url(params)}
                        method="put"
                        className="grid gap-4 rounded-xl border p-4"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        defaultValue={menu.name}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        Descrição
                                    </Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        defaultValue={menu.description ?? ''}
                                    />
                                    <InputError message={errors.description} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        name="status"
                                        defaultValue={menu.status}
                                        className="h-9 rounded-md border bg-transparent px-2 text-sm"
                                    >
                                        {statuses.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} />
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />}
                                        Salvar
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline">
                                                Excluir
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Excluir este cardápio?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Os produtos do catálogo
                                                    continuam. Só a vitrine será
                                                    removida.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Voltar
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        router.delete(
                                                            destroy.url(params),
                                                        )
                                                    }
                                                >
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </>
                        )}
                    </Form>
                )}

                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-medium">Produtos</h2>
                        {canManage && (
                            <Dialog
                                open={dialogOpen}
                                onOpenChange={setDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button size="sm">Adicionar</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Adicionar produtos
                                        </DialogTitle>
                                        <DialogDescription>
                                            Escolha produtos do catálogo para
                                            este cardápio.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {availableProducts.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Todos os produtos já estão neste
                                            cardápio.
                                        </p>
                                    ) : (
                                        <ul className="max-h-72 space-y-2 overflow-y-auto">
                                            {availableProducts.map(
                                                (product) => (
                                                    <li
                                                        key={product.id}
                                                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/60"
                                                    >
                                                        <Checkbox
                                                            checked={selectedIds.includes(
                                                                product.id,
                                                            )}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                setSelectedIds(
                                                                    (
                                                                        current,
                                                                    ) =>
                                                                        checked ===
                                                                        true
                                                                            ? [
                                                                                  ...current,
                                                                                  product.id,
                                                                              ]
                                                                            : current.filter(
                                                                                  (
                                                                                      id,
                                                                                  ) =>
                                                                                      id !==
                                                                                      product.id,
                                                                              ),
                                                                );
                                                            }}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatMoney(
                                                                    product.price,
                                                                )}
                                                                {!product.active
                                                                    ? ' · inativo no catálogo'
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            disabled={selectedIds.length === 0}
                                            onClick={submitSelectedProducts}
                                        >
                                            Adicionar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhum produto neste cardápio ainda.
                        </p>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={canManage ? handleDragEnd : undefined}
                        >
                            <SortableContext
                                items={items.map((item) => item.product_id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <ul className="space-y-2">
                                    {items.map((item) => (
                                        <SortableMenuItem
                                            key={item.product_id}
                                            item={item}
                                            sortable={canManage}
                                            canManage={canManage}
                                            onToggle={toggleAvailability}
                                            onRemove={() =>
                                                router.delete(
                                                    removeProduct.url({
                                                        ...params,
                                                        product:
                                                            item.product_id,
                                                    }),
                                                    { preserveScroll: true },
                                                )
                                            }
                                        />
                                    ))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    )}
                </section>
            </div>
        </>
    );
}

function SortableMenuItem({
    item,
    sortable,
    canManage,
    onToggle,
    onRemove,
}: {
    item: MenuProductItem;
    sortable: boolean;
    canManage: boolean;
    onToggle: (item: MenuProductItem) => void;
    onRemove: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.product_id, disabled: !sortable });

    return (
        <li
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={cn(
                'flex items-center gap-3 rounded-xl border bg-card p-3 motion-safe:transition-opacity',
                isDragging && 'opacity-80 shadow-md',
                !item.active && 'opacity-70',
            )}
        >
            {sortable && (
                <button
                    type="button"
                    className="cursor-grab touch-none text-muted-foreground"
                    aria-label="Reordenar"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="size-4" />
                </button>
            )}
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                    {formatMoney(item.price)}
                    {!item.product_active ? ' · inativo no catálogo' : ''}
                </p>
            </div>
            {canManage && (
                <Switch
                    checked={item.active}
                    onCheckedChange={() => onToggle(item)}
                    aria-label={item.active ? 'Disponível' : 'Indisponível'}
                />
            )}
            {canManage && (
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Remover do cardápio"
                    onClick={onRemove}
                >
                    <Trash2 className="size-4" />
                </Button>
            )}
        </li>
    );
}

MenusShow.layout = {
    breadcrumbs: [
        { title: 'Cardápios', href: '#' },
        { title: 'Editar', href: '#' },
    ],
};
