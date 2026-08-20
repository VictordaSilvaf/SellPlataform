import { Head, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Parallax } from '@/components/landing/parallax';
import { Reveal } from '@/components/landing/reveal';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatMoney } from '@/lib/money';

type PublicProduct = {
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
};

type PublicSection = {
    name: string;
    description: string | null;
    products: PublicProduct[];
};

function ProductCard({ product }: { product: PublicProduct }) {
    return (
        <article className="overflow-hidden rounded-xl bg-card shadow-card">
            {product.image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                    <img
                        src={product.image_url}
                        alt=""
                        className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out group-hover:scale-105"
                    />
                </div>
            )}
            <div className="px-4 py-4">
                <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="shrink-0 text-sm font-medium">
                        {formatMoney(product.price)}
                    </p>
                </div>
                {product.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {product.description}
                    </p>
                )}
            </div>
        </article>
    );
}

export default function PublicMenu({
    available,
    workspace,
    menu,
    unsectioned,
    sections,
}: {
    available: boolean;
    workspace: {
        name: string;
        logo_url: string | null;
        cover_url: string | null;
    };
    menu: { name: string; description: string | null };
    unsectioned: PublicProduct[];
    sections: PublicSection[];
}) {
    const { name } = usePage().props;
    const empty = unsectioned.length === 0 && sections.length === 0;

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
                <header className="absolute top-0 right-0 z-10 px-4 py-3">
                    <ThemeToggle />
                </header>
                <main className="mx-auto flex max-w-lg flex-col pb-16">
                    <div className="relative overflow-hidden">
                        {workspace.cover_url ? (
                            <div className="aspect-video overflow-hidden">
                                <Parallax speed={0.22} className="h-full">
                                    <img
                                        src={workspace.cover_url}
                                        alt=""
                                        className="size-full object-cover motion-safe:animate-menu-cover"
                                    />
                                </Parallax>
                            </div>
                        ) : (
                            <div className="aspect-video overflow-hidden bg-primary-soft">
                                <Parallax
                                    speed={0.16}
                                    className="size-full bg-primary/20 motion-safe:animate-menu-cover"
                                />
                            </div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 bg-linear-to-t from-background via-background/40 to-transparent px-4 pb-6 text-center">
                            <span className="flex size-16 overflow-hidden rounded-xl bg-background motion-safe:animate-menu-rise">
                                {workspace.logo_url ? (
                                    <img
                                        src={workspace.logo_url}
                                        alt=""
                                        className="size-16 object-cover"
                                    />
                                ) : (
                                    <AppLogoIcon className="size-16" alt="" />
                                )}
                            </span>
                            <p className="text-sm font-medium motion-safe:animate-menu-rise motion-safe:[animation-delay:90ms]">
                                {workspace.name}
                            </p>
                            <h1 className="text-2xl font-semibold tracking-tight motion-safe:animate-menu-rise motion-safe:[animation-delay:160ms]">
                                {available
                                    ? menu.name
                                    : 'Cardápio indisponível'}
                            </h1>
                            {available ? (
                                menu.description && (
                                    <p className="max-w-[36ch] text-pretty text-muted-foreground motion-safe:animate-menu-rise motion-safe:[animation-delay:240ms]">
                                        {menu.description}
                                    </p>
                                )
                            ) : (
                                <p className="max-w-[36ch] text-pretty text-muted-foreground motion-safe:animate-menu-rise motion-safe:[animation-delay:240ms]">
                                    Este cardápio não está disponível no
                                    momento.
                                </p>
                            )}
                        </div>
                    </div>

                    {available && (
                        <div className="flex flex-col gap-8 px-4 pt-8">
                            {empty && (
                                <Reveal>
                                    <p className="rounded-xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">
                                        Nenhum produto disponível agora.
                                    </p>
                                </Reveal>
                            )}
                            {unsectioned.length > 0 && (
                                <ul className="flex flex-col gap-3">
                                    {unsectioned.map((product, index) => (
                                        <li
                                            key={`${product.name}-${product.price}-${index}`}
                                        >
                                            <Reveal
                                                from="scale"
                                                delay={
                                                    index < 4
                                                        ? 80 * (index + 1)
                                                        : 0
                                                }
                                            >
                                                <div className="group">
                                                    <ProductCard
                                                        product={product}
                                                    />
                                                </div>
                                            </Reveal>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {sections.map((section, sectionIndex) => (
                                <section
                                    key={`${section.name}-${sectionIndex}`}
                                    className="flex flex-col gap-3"
                                >
                                    <Reveal delay={40}>
                                        <h2 className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                            {section.name}
                                        </h2>
                                        {section.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {section.description}
                                            </p>
                                        )}
                                    </Reveal>
                                    <ul className="flex flex-col gap-3">
                                        {section.products.map(
                                            (product, index) => (
                                                <li
                                                    key={`${section.name}-${product.name}-${index}`}
                                                >
                                                    <Reveal
                                                        from="scale"
                                                        delay={
                                                            index < 3
                                                                ? 70 *
                                                                  (index + 1)
                                                                : 0
                                                        }
                                                    >
                                                        <div className="group">
                                                            <ProductCard
                                                                product={
                                                                    product
                                                                }
                                                            />
                                                        </div>
                                                    </Reveal>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
