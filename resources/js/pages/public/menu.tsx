import { Head, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatMoney } from '@/lib/money';

type PublicProduct = {
    name: string;
    description: string | null;
    price: number;
};

export default function PublicMenu({
    available,
    workspace,
    menu,
    products,
}: {
    available: boolean;
    workspace: { name: string };
    menu: { name: string; description: string | null };
    products: PublicProduct[];
}) {
    const { name } = usePage().props;

    return (
        <>
            <Head title={available ? menu.name : 'Cardápio indisponível'}>
                <meta
                    name="description"
                    content={
                        menu.description ??
                        `Cardápio de ${workspace.name} no ${name}.`
                    }
                />
            </Head>
            <div className="min-h-screen bg-background text-foreground">
                <header className="flex items-center justify-end px-4 py-3">
                    <ThemeToggle />
                </header>
                <main className="mx-auto flex max-w-lg flex-col gap-8 px-4 pb-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <span className="flex size-16 overflow-hidden rounded-xl">
                            <AppLogoIcon className="size-16" alt="" />
                        </span>
                        <p className="text-sm font-medium text-muted-foreground">
                            {workspace.name}
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {available ? menu.name : 'Cardápio indisponível'}
                        </h1>
                        {available ? (
                            menu.description && (
                                <p className="max-w-[36ch] text-pretty text-muted-foreground">
                                    {menu.description}
                                </p>
                            )
                        ) : (
                            <p className="max-w-[36ch] text-pretty text-muted-foreground">
                                Este cardápio não está disponível no momento.
                            </p>
                        )}
                    </div>

                    {available && (
                        <ul className="flex flex-col gap-3">
                            {products.length === 0 ? (
                                <li className="rounded-xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">
                                    Nenhum produto disponível agora.
                                </li>
                            ) : (
                                products.map((product) => (
                                    <li
                                        key={`${product.name}-${product.price}`}
                                        className="rounded-xl bg-card px-4 py-4 motion-safe:transition-opacity"
                                    >
                                        <div className="flex items-baseline justify-between gap-4">
                                            <h2 className="font-medium">
                                                {product.name}
                                            </h2>
                                            <p className="shrink-0 text-sm font-medium">
                                                {formatMoney(product.price)}
                                            </p>
                                        </div>
                                        {product.description && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {product.description}
                                            </p>
                                        )}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </main>
            </div>
        </>
    );
}
