import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';

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

function Reveal({
    children,
    delay = 0,
    observe = false,
}: {
    children: ReactNode;
    delay?: number;
    observe?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(!observe);

    useEffect(() => {
        if (!observe) {
            return;
        }

        const node = ref.current;

        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12 },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [observe]);

    return (
        <div
            ref={ref}
            className={cn(
                'motion-safe:transition-[opacity,transform] motion-safe:duration-300',
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'motion-safe:translate-y-2 motion-safe:opacity-0',
            )}
            style={{
                transitionDelay: visible ? `${delay}ms` : undefined,
            }}
        >
            {children}
        </div>
    );
}

function ProductCard({ product }: { product: PublicProduct }) {
    return (
        <article className="overflow-hidden rounded-xl bg-card">
            {product.image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                    <img
                        src={product.image_url}
                        alt=""
                        className="size-full object-cover"
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
    const empty =
        unsectioned.length === 0 && sections.length === 0;

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
                    <Reveal>
                        <div className="relative overflow-hidden">
                            {workspace.cover_url ? (
                                <div className="aspect-video">
                                    <img
                                        src={workspace.cover_url}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-primary-soft" />
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 bg-linear-to-t from-background via-background/40 to-transparent px-4 pb-6 text-center">
                                <span className="flex size-16 overflow-hidden rounded-xl bg-background">
                                    {workspace.logo_url ? (
                                        <img
                                            src={workspace.logo_url}
                                            alt=""
                                            className="size-16 object-cover"
                                        />
                                    ) : (
                                        <AppLogoIcon
                                            className="size-16"
                                            alt=""
                                        />
                                    )}
                                </span>
                                <p className="text-sm font-medium">
                                    {workspace.name}
                                </p>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {available
                                        ? menu.name
                                        : 'Cardápio indisponível'}
                                </h1>
                                {available ? (
                                    menu.description && (
                                        <p className="max-w-[36ch] text-pretty text-muted-foreground">
                                            {menu.description}
                                        </p>
                                    )
                                ) : (
                                    <p className="max-w-[36ch] text-pretty text-muted-foreground">
                                        Este cardápio não está disponível no
                                        momento.
                                    </p>
                                )}
                            </div>
                        </div>
                    </Reveal>

                    {available && (
                        <div className="flex flex-col gap-8 px-4 pt-8">
                            {empty && (
                                <p className="rounded-xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">
                                    Nenhum produto disponível agora.
                                </p>
                            )}
                            {unsectioned.length > 0 && (
                                <ul className="flex flex-col gap-3">
                                    {unsectioned.map((product, index) => (
                                        <li
                                            key={`${product.name}-${product.price}-${index}`}
                                        >
                                            <Reveal
                                                delay={
                                                    index < 4
                                                        ? 80 * (index + 1)
                                                        : 0
                                                }
                                                observe={index >= 4}
                                            >
                                                <ProductCard
                                                    product={product}
                                                />
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
                                    <Reveal
                                        delay={80 * (sectionIndex + 1)}
                                        observe={sectionIndex >= 3}
                                    >
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
                                                        delay={
                                                            index < 3
                                                                ? 60 *
                                                                  (index + 1)
                                                                : 0
                                                        }
                                                        observe={index >= 3}
                                                    >
                                                        <ProductCard
                                                            product={product}
                                                        />
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
