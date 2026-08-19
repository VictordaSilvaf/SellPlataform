import { Head, Link, router, usePage } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatMoney } from '@/lib/money';
import { create, edit, index, toggle } from '@/routes/workspace/products';
import type { Paginated, Product } from '@/types';

export default function ProductsIndex({
    products,
    filters,
    canManage,
}: {
    products: Paginated<Product>;
    filters: { search: string; status: string };
    canManage: boolean;
}) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';

    return (
        <>
            <Head title="Produtos" />
            <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Produtos"
                        description="Cadastre e gerencie os produtos deste ambiente."
                    />
                    {canManage && (
                        <Button asChild>
                            <Link href={create(slug)}>Novo produto</Link>
                        </Button>
                    )}
                </div>
                <form
                    className="flex flex-col gap-2 sm:flex-row"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        router.get(index.url(slug), {
                            search: String(form.get('search') ?? ''),
                            status: String(form.get('status') ?? ''),
                        });
                    }}
                >
                    <Input
                        name="search"
                        placeholder="Buscar"
                        defaultValue={filters.search}
                    />
                    <select
                        name="status"
                        defaultValue={filters.status}
                        className="h-9 rounded-md border bg-transparent px-2 text-sm"
                    >
                        <option value="">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>
                    <Button type="submit" variant="outline">
                        Filtrar
                    </Button>
                </form>
                {products.data.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="Você ainda não possui produtos."
                        description="Cadastre seu primeiro produto para começar."
                        actionLabel={
                            canManage ? 'Cadastrar produto' : undefined
                        }
                        actionHref={canManage ? create.url(slug) : undefined}
                    />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Preço</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>
                                            {formatMoney(product.price)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    product.active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {product.active
                                                    ? 'Ativo'
                                                    : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                product.created_at,
                                            ).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            {canManage && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={edit.url({
                                                                workspace: slug,
                                                                product:
                                                                    product.id,
                                                            })}
                                                        >
                                                            Editar
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            router.patch(
                                                                toggle.url({
                                                                    workspace:
                                                                        slug,
                                                                    product:
                                                                        product.id,
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        {product.active
                                                            ? 'Desativar'
                                                            : 'Ativar'}
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Pagination meta={products} />
                    </>
                )}
            </div>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [{ title: 'Produtos', href: '#' }],
};
