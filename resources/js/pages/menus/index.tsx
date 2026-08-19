import { Head, Link, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
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
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { create, destroy, show } from '@/routes/workspace/menus';
import type { Menu, MenuStatus } from '@/types';

const statusLabel: Record<MenuStatus, string> = {
    DRAFT: 'Rascunho',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
};

const statusVariant: Record<MenuStatus, 'warning' | 'success' | 'secondary'> = {
    DRAFT: 'warning',
    ACTIVE: 'success',
    INACTIVE: 'secondary',
};

export default function MenusIndex({
    menus,
    canCreate,
    canManage,
    limitReached,
}: {
    menus: Menu[];
    canCreate: boolean;
    canManage: boolean;
    limitReached: boolean;
}) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';
    const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

    return (
        <>
            <Head title="Cardápios" />
            <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Cardápios"
                        description="Monte vitrines com os produtos deste ambiente."
                    />
                    {canCreate && (
                        <Button asChild>
                            <Link href={create(slug)}>Novo cardápio</Link>
                        </Button>
                    )}
                </div>
                {limitReached && (
                    <p className="text-sm text-destructive">
                        Você atingiu o limite de cardápios deste plano.
                    </p>
                )}
                {menus.length === 0 ? (
                    <EmptyState
                        icon={UtensilsCrossed}
                        title="Você ainda não possui cardápios."
                        description="Crie um cardápio para organizar e disponibilizar seus produtos."
                        actionLabel={canCreate ? 'Criar cardápio' : undefined}
                        actionHref={canCreate ? create.url(slug) : undefined}
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {menus.map((menu) => (
                            <Card key={menu.id}>
                                <CardHeader className="flex flex-row items-start justify-between gap-3">
                                    <CardTitle>{menu.name}</CardTitle>
                                    <Badge variant={statusVariant[menu.status]}>
                                        {statusLabel[menu.status]}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm text-muted-foreground">
                                        {menu.products_count}{' '}
                                        {menu.products_count === 1
                                            ? 'produto'
                                            : 'produtos'}
                                    </p>
                                    <div className="flex gap-2">
                                        <MenuQrDialog
                                            name={menu.name}
                                            publicUrl={menu.public_url}
                                            logoUrl={currentWorkspace?.logo_url}
                                            trigger={
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    Ver QR Code
                                                </Button>
                                            }
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={show.url({
                                                    workspace: slug,
                                                    menu: menu.id,
                                                })}
                                            >
                                                Editar
                                            </Link>
                                        </Button>
                                        {canManage && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        aria-label={`Mais ações para ${menu.name}`}
                                                    >
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onSelect={() =>
                                                            setMenuToDelete(
                                                                menu,
                                                            )
                                                        }
                                                    >
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <AlertDialog
                open={menuToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setMenuToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Excluir este cardápio?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Os produtos do catálogo continuam. Só a vitrine será
                            removida.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (menuToDelete === null) {
                                    return;
                                }

                                router.delete(
                                    destroy.url({
                                        workspace: slug,
                                        menu: menuToDelete.id,
                                    }),
                                );
                            }}
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

MenusIndex.layout = {
    breadcrumbs: [{ title: 'Cardápios', href: '#' }],
};
