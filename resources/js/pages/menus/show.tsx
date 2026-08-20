import {
    closestCorners,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useDroppable,
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
import { GripVertical, Plus, Trash2 } from 'lucide-react';
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
import {
    destroy as destroySection,
    order as orderSections,
    store as storeSection,
    toggle as toggleSection,
    update as updateSection,
} from '@/routes/workspace/menus/sections';
import type {
    MenuProductItem,
    MenuSection,
    MenuStatus,
    Product,
} from '@/types';

const UNSECTIONED = 'unsectioned';

type MenuShowProps = {
    menu: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        status: MenuStatus;
        public_url: string;
    };
    sections: MenuSection[];
    unsectionedItems: MenuProductItem[];
    availableProducts: Pick<Product, 'id' | 'name' | 'price' | 'active'>[];
    statuses: { value: MenuStatus; label: string }[];
    canManage: boolean;
};

function productDragId(productId: number): string {
    return `p-${productId}`;
}

function sectionDragId(sectionId: number): string {
    return `s-${sectionId}`;
}

function layoutItems(
    sections: MenuSection[],
    unsectionedItems: MenuProductItem[],
): { product_id: number; menu_section_id: number | null; position: number }[] {
    return [
        ...unsectionedItems.map((item, index) => ({
            product_id: item.product_id,
            menu_section_id: null,
            position: index + 1,
        })),
        ...sections.flatMap((section) =>
            section.items.map((item, index) => ({
                product_id: item.product_id,
                menu_section_id: section.id,
                position: index + 1,
            })),
        ),
    ];
}

export default function MenusShow({
    menu,
    sections,
    unsectionedItems,
    availableProducts,
    statuses,
    canManage,
}: MenuShowProps) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
    const [targetSectionId, setTargetSectionId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sectionName, setSectionName] = useState('');
    const [sectionDescription, setSectionDescription] = useState('');
    const [creatingSection, setCreatingSection] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const params = { workspace: slug, menu: menu.id };

    function persistProducts(
        nextSections: MenuSection[],
        nextUnsectioned: MenuProductItem[],
    ): void {
        router
            .optimistic(() => ({
                sections: nextSections,
                unsectionedItems: nextUnsectioned,
            }))
            .patch(
                order.url(params),
                { items: layoutItems(nextSections, nextUnsectioned) },
                {
                    preserveScroll: true,
                    onError: () =>
                        toast.error(
                            'Não foi possível reordenar os produtos.',
                        ),
                },
            );
    }

    function toggleAvailability(item: MenuProductItem): void {
        const next = !item.active;

        router
            .optimistic((props: MenuShowProps) => ({
                sections: props.sections.map((section) => ({
                    ...section,
                    items: section.items.map((row) =>
                        row.product_id === item.product_id
                            ? { ...row, active: next }
                            : row,
                    ),
                })),
                unsectionedItems: props.unsectionedItems.map((row) =>
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

        const activeId = String(active.id);
        const overId = String(over.id);

        if (activeId.startsWith('s-') && overId.startsWith('s-')) {
            const oldIndex = sections.findIndex(
                (section) => sectionDragId(section.id) === activeId,
            );
            const newIndex = sections.findIndex(
                (section) => sectionDragId(section.id) === overId,
            );

            if (oldIndex < 0 || newIndex < 0) {
                return;
            }

            const next = arrayMove(sections, oldIndex, newIndex);

            router
                .optimistic(() => ({ sections: next }))
                .patch(
                    orderSections.url(params),
                    { section_ids: next.map((section) => section.id) },
                    {
                        preserveScroll: true,
                        onError: () =>
                            toast.error(
                                'Não foi possível reordenar as sessões.',
                            ),
                    },
                );

            return;
        }

        if (!activeId.startsWith('p-')) {
            return;
        }

        const productId = Number(activeId.slice(2));
        let fromContainer = UNSECTIONED;
        let fromIndex = unsectionedItems.findIndex(
            (item) => item.product_id === productId,
        );

        if (fromIndex < 0) {
            for (const section of sections) {
                const index = section.items.findIndex(
                    (item) => item.product_id === productId,
                );

                if (index >= 0) {
                    fromContainer = String(section.id);
                    fromIndex = index;
                    break;
                }
            }
        }

        if (fromIndex < 0) {
            return;
        }

        let toContainer = fromContainer;
        let toIndex = fromIndex;

        if (overId.startsWith('p-')) {
            const overProductId = Number(overId.slice(2));
            const unsectionedIndex = unsectionedItems.findIndex(
                (item) => item.product_id === overProductId,
            );

            if (unsectionedIndex >= 0) {
                toContainer = UNSECTIONED;
                toIndex = unsectionedIndex;
            } else {
                for (const section of sections) {
                    const index = section.items.findIndex(
                        (item) => item.product_id === overProductId,
                    );

                    if (index >= 0) {
                        toContainer = String(section.id);
                        toIndex = index;
                        break;
                    }
                }
            }
        } else if (overId.startsWith('c-')) {
            toContainer = overId.slice(2);
            toIndex =
                toContainer === UNSECTIONED
                    ? unsectionedItems.length
                    : (sections.find((section) => String(section.id) === toContainer)
                          ?.items.length ?? 0);
        }

        const moving =
            fromContainer === UNSECTIONED
                ? unsectionedItems[fromIndex]
                : sections.find((section) => String(section.id) === fromContainer)
                      ?.items[fromIndex];

        if (!moving) {
            return;
        }

        if (fromContainer === toContainer) {
            if (fromIndex === toIndex) {
                return;
            }

            persistProducts(
                toContainer === UNSECTIONED
                    ? sections
                    : sections.map((section) =>
                          String(section.id) === toContainer
                              ? {
                                    ...section,
                                    items: arrayMove(
                                        section.items,
                                        fromIndex,
                                        toIndex,
                                    ),
                                }
                              : section,
                      ),
                toContainer === UNSECTIONED
                    ? arrayMove(unsectionedItems, fromIndex, toIndex)
                    : unsectionedItems,
            );

            return;
        }

        const nextUnsectioned =
            fromContainer === UNSECTIONED
                ? unsectionedItems.filter(
                      (item) => item.product_id !== productId,
                  )
                : [...unsectionedItems];
        let nextSections = sections.map((section) =>
            String(section.id) === fromContainer
                ? {
                      ...section,
                      items: section.items.filter(
                          (item) => item.product_id !== productId,
                      ),
                  }
                : { ...section, items: [...section.items] },
        );

        if (toContainer === UNSECTIONED) {
            nextUnsectioned.splice(toIndex, 0, {
                ...moving,
                menu_section_id: null,
            });
        } else {
            nextSections = nextSections.map((section) => {
                if (String(section.id) !== toContainer) {
                    return section;
                }

                const items = [...section.items];
                items.splice(toIndex, 0, {
                    ...moving,
                    menu_section_id: section.id,
                });

                return { ...section, items };
            });
        }

        persistProducts(nextSections, nextUnsectioned);
    }

    function submitSelectedProducts(): void {
        if (selectedIds.length === 0) {
            return;
        }

        router.post(
            addProducts.url(params),
            {
                product_ids: selectedIds,
                menu_section_id: targetSectionId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setDialogOpen(false);
                },
            },
        );
    }

    function createSection(): void {
        if (sectionName.trim() === '') {
            return;
        }

        setCreatingSection(true);

        router.post(
            storeSection.url(params),
            {
                name: sectionName.trim(),
                description:
                    sectionDescription.trim() === ''
                        ? null
                        : sectionDescription.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSectionName('');
                    setSectionDescription('');
                    setSectionDialogOpen(false);
                },
                onFinish: () => setCreatingSection(false),
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
                        description="Organize sessões, ative produtos e compartilhe o QR."
                    />
                    <div className="flex flex-wrap gap-2">
                        <MenuQrDialog
                            name={menu.name}
                            publicUrl={menu.public_url}
                            logoUrl={currentWorkspace?.logo_url}
                            trigger={
                                <Button variant="outline">Ver QR Code</Button>
                            }
                        />
                        <Button variant="outline" asChild>
                            <Link href={index.url(slug)}>Voltar</Link>
                        </Button>
                    </div>
                </div>

                <p className="text-sm [overflow-wrap:anywhere] text-muted-foreground">
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
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-base font-medium">Produtos</h2>
                        {canManage && (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    type="button"
                                    onClick={() => setSectionDialogOpen(true)}
                                >
                                    Nova sessão
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setTargetSectionId(null);
                                        setDialogOpen(true);
                                    }}
                                >
                                    Adicionar
                                </Button>
                            </div>
                        )}
                    </div>

                    <CreateSectionDialog
                        open={sectionDialogOpen}
                        onOpenChange={(open) => {
                            setSectionDialogOpen(open);

                            if (!open) {
                                setSectionName('');
                                setSectionDescription('');
                            }
                        }}
                        name={sectionName}
                        description={sectionDescription}
                        processing={creatingSection}
                        onNameChange={setSectionName}
                        onDescriptionChange={setSectionDescription}
                        onSubmit={createSection}
                    />

                    <AddProductsDialog
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                        availableProducts={availableProducts}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        onSubmit={submitSelectedProducts}
                    />

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragEnd={canManage ? handleDragEnd : undefined}
                    >
                        <ProductGroup
                            id={UNSECTIONED}
                            title={null}
                            items={unsectionedItems}
                            sortable={canManage}
                            canManage={canManage}
                            onToggle={toggleAvailability}
                            onRemove={(item) =>
                                router.delete(
                                    removeProduct.url({
                                        ...params,
                                        product: item.product_id,
                                    }),
                                    { preserveScroll: true },
                                )
                            }
                            onAdd={
                                canManage
                                    ? () => {
                                          setTargetSectionId(null);
                                          setDialogOpen(true);
                                      }
                                    : undefined
                            }
                        />

                        <SortableContext
                            items={sections.map((section) =>
                                sectionDragId(section.id),
                            )}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {sections.map((section) => (
                                    <SortableSection
                                        key={section.id}
                                        section={section}
                                        sortable={canManage}
                                        canManage={canManage}
                                        params={params}
                                        onToggle={toggleAvailability}
                                        onRemoveProduct={(item) =>
                                            router.delete(
                                                removeProduct.url({
                                                    ...params,
                                                    product: item.product_id,
                                                }),
                                                { preserveScroll: true },
                                            )
                                        }
                                        onAdd={() => {
                                            setTargetSectionId(section.id);
                                            setDialogOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </section>
            </div>
        </>
    );
}

function CreateSectionDialog({
    open,
    onOpenChange,
    name,
    description,
    processing,
    onNameChange,
    onDescriptionChange,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name: string;
    description: string;
    processing: boolean;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSubmit: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="motion-safe:duration-200">
                <DialogHeader>
                    <DialogTitle>Nova sessão</DialogTitle>
                    <DialogDescription>
                        Agrupe produtos no cardápio. A descrição aparece na
                        vitrine pública.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="section-name">Nome</Label>
                        <Input
                            id="section-name"
                            value={name}
                            onChange={(event) =>
                                onNameChange(event.target.value)
                            }
                            placeholder="Hambúrgueres"
                            autoFocus
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    onSubmit();
                                }
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="section-description">Descrição</Label>
                        <textarea
                            id="section-description"
                            value={description}
                            onChange={(event) =>
                                onDescriptionChange(event.target.value)
                            }
                            placeholder="Opcional — ex.: nossos clássicos"
                            className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        disabled={processing || name.trim() === ''}
                        onClick={onSubmit}
                    >
                        {processing && <Spinner />}
                        Criar sessão
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AddProductsDialog({
    open,
    onOpenChange,
    availableProducts,
    selectedIds,
    setSelectedIds,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableProducts: Pick<Product, 'id' | 'name' | 'price' | 'active'>[];
    selectedIds: number[];
    setSelectedIds: (value: number[] | ((current: number[]) => number[])) => void;
    onSubmit: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="motion-safe:duration-200">
                <DialogHeader>
                    <DialogTitle>Adicionar produtos</DialogTitle>
                    <DialogDescription>
                        Escolha produtos do catálogo para este cardápio.
                    </DialogDescription>
                </DialogHeader>
                {availableProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Todos os produtos já estão neste cardápio.
                    </p>
                ) : (
                    <ul className="max-h-72 space-y-2 overflow-y-auto">
                        {availableProducts.map((product) => (
                            <li
                                key={product.id}
                                className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/60"
                            >
                                <Checkbox
                                    checked={selectedIds.includes(product.id)}
                                    onCheckedChange={(checked) => {
                                        setSelectedIds((current) =>
                                            checked === true
                                                ? [...current, product.id]
                                                : current.filter(
                                                      (id) => id !== product.id,
                                                  ),
                                        );
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatMoney(product.price)}
                                        {!product.active
                                            ? ' · inativo no catálogo'
                                            : ''}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <DialogFooter>
                    <Button
                        type="button"
                        disabled={selectedIds.length === 0}
                        onClick={onSubmit}
                    >
                        Adicionar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SortableSection({
    section,
    sortable,
    canManage,
    params,
    onToggle,
    onRemoveProduct,
    onAdd,
}: {
    section: MenuSection;
    sortable: boolean;
    canManage: boolean;
    params: { workspace: string; menu: number };
    onToggle: (item: MenuProductItem) => void;
    onRemoveProduct: (item: MenuProductItem) => void;
    onAdd: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: sectionDragId(section.id), disabled: !sortable });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={cn(
                'rounded-xl border p-3 motion-safe:transition-opacity',
                isDragging && 'opacity-80 shadow-md',
                !section.active && 'opacity-70',
            )}
        >
            <div className="mb-3 flex items-center gap-2">
                {sortable && (
                    <button
                        type="button"
                        className="cursor-grab touch-none text-muted-foreground"
                        aria-label="Reordenar sessão"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="size-4" />
                    </button>
                )}
                {canManage ? (
                    <Input
                        defaultValue={section.name}
                        className="h-8 font-medium"
                        onBlur={(event) => {
                            if (event.target.value === section.name) {
                                return;
                            }

                            router.put(
                                updateSection.url({
                                    ...params,
                                    section: section.id,
                                }),
                                {
                                    name: event.target.value,
                                    description: section.description,
                                },
                                { preserveScroll: true },
                            );
                        }}
                    />
                ) : (
                    <h3 className="flex-1 font-medium">{section.name}</h3>
                )}
                {canManage && (
                    <>
                        <Switch
                            checked={section.active}
                            onCheckedChange={(checked) =>
                                router.patch(
                                    toggleSection.url({
                                        ...params,
                                        section: section.id,
                                    }),
                                    { active: checked },
                                    { preserveScroll: true },
                                )
                            }
                            aria-label="Sessão ativa"
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label="Adicionar produtos"
                            onClick={onAdd}
                        >
                            <Plus className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label="Excluir sessão"
                            onClick={() =>
                                router.delete(
                                    destroySection.url({
                                        ...params,
                                        section: section.id,
                                    }),
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </>
                )}
            </div>
            {canManage ? (
                <textarea
                    key={`section-description-${section.id}-${section.description ?? ''}`}
                    defaultValue={section.description ?? ''}
                    placeholder="Descrição da sessão (opcional)"
                    className="mb-3 min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onBlur={(event) => {
                        const next =
                            event.target.value.trim() === ''
                                ? null
                                : event.target.value.trim();

                        if (next === section.description) {
                            return;
                        }

                        router.put(
                            updateSection.url({
                                ...params,
                                section: section.id,
                            }),
                            {
                                name: section.name,
                                description: next,
                            },
                            { preserveScroll: true },
                        );
                    }}
                />
            ) : (
                section.description && (
                    <p className="mb-3 text-sm text-muted-foreground">
                        {section.description}
                    </p>
                )
            )}
            <ProductGroup
                id={String(section.id)}
                title={null}
                items={section.items}
                sortable={canManage}
                canManage={canManage}
                onToggle={onToggle}
                onRemove={onRemoveProduct}
            />
        </div>
    );
}

function ProductGroup({
    id,
    title,
    items,
    sortable,
    canManage,
    onToggle,
    onRemove,
    onAdd,
}: {
    id: string;
    title: string | null;
    items: MenuProductItem[];
    sortable: boolean;
    canManage: boolean;
    onToggle: (item: MenuProductItem) => void;
    onRemove: (item: MenuProductItem) => void;
    onAdd?: () => void;
}) {
    const { setNodeRef } = useDroppable({ id: `c-${id}` });

    return (
        <div ref={setNodeRef} className="space-y-2">
            {title && (
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{title}</h3>
                    {onAdd && (
                        <Button size="sm" variant="ghost" onClick={onAdd}>
                            Adicionar
                        </Button>
                    )}
                </div>
            )}
            <SortableContext
                items={items.map((item) => productDragId(item.product_id))}
                strategy={verticalListSortingStrategy}
            >
                <ul className="space-y-2">
                    {items.length === 0 ? (
                        <li className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            Nenhum produto aqui ainda.
                        </li>
                    ) : (
                        items.map((item) => (
                            <SortableMenuItem
                                key={item.product_id}
                                item={item}
                                sortable={sortable}
                                canManage={canManage}
                                onToggle={onToggle}
                                onRemove={() => onRemove(item)}
                            />
                        ))
                    )}
                </ul>
            </SortableContext>
        </div>
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
    } = useSortable({
        id: productDragId(item.product_id),
        disabled: !sortable,
    });

    return (
        <li
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={cn(
                'flex items-center gap-3 rounded-xl border bg-card p-3 motion-safe:transition-[opacity,transform]',
                isDragging && 'scale-[1.02] opacity-80 shadow-md',
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
            {item.image_url && (
                <img
                    src={item.image_url}
                    alt=""
                    className="size-10 rounded-md object-cover"
                />
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
