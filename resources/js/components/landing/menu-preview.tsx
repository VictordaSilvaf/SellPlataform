import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';

export type MenuPreviewSection = {
    name: string;
    products: { name: string; price: number }[];
};

export type MenuPreviewData = {
    name: string;
    menu: string;
    accent: string;
    sections: MenuPreviewSection[];
};

const defaultMenu: MenuPreviewData = {
    name: 'Café da Esquina',
    menu: 'Cardápio do dia',
    accent: 'bg-primary-soft',
    sections: [
        {
            name: 'Cafés',
            products: [
                { name: 'Expresso', price: 600 },
                { name: 'Cappuccino', price: 950 },
            ],
        },
        {
            name: 'Salgados',
            products: [
                { name: 'Pão de queijo', price: 850 },
                { name: 'Torta de limão', price: 7200 },
            ],
        },
    ],
};

export const featuredMenus: MenuPreviewData[] = [
    defaultMenu,
    {
        name: 'Padaria da Rua',
        menu: 'Manhã e tarde',
        accent: 'bg-warning-soft',
        sections: [
            {
                name: 'Pães',
                products: [
                    { name: 'Pão francês', price: 150 },
                    { name: 'Pão de milho', price: 450 },
                ],
            },
            {
                name: 'Doces',
                products: [
                    { name: 'Sonho', price: 700 },
                    { name: 'Bolo de milho', price: 2800 },
                ],
            },
        ],
    },
    {
        name: 'Bistrô do Parque',
        menu: 'Almoço',
        accent: 'bg-success-soft',
        sections: [
            {
                name: 'Pratos',
                products: [
                    { name: 'Executivo', price: 3290 },
                    { name: 'Salada da casa', price: 2490 },
                ],
            },
            {
                name: 'Bebidas',
                products: [
                    { name: 'Suco natural', price: 1200 },
                    { name: 'Água com gás', price: 600 },
                ],
            },
        ],
    },
];

export function MenuPreview({
    menu = defaultMenu,
    tilted = true,
}: {
    menu?: MenuPreviewData;
    tilted?: boolean;
}) {
    return (
        <figure
            className={cn(
                'relative mx-auto w-full max-w-md',
                tilted &&
                    'motion-safe:origin-bottom-right motion-safe:rotate-2',
            )}
        >
            <div
                aria-hidden
                className="absolute -inset-6 rounded-[1.25rem] bg-primary/15 blur-2xl dark:bg-primary/25"
            />
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
                <div className={cn('relative aspect-video', menu.accent)}>
                    <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 bg-linear-to-t from-background via-background/40 to-transparent px-5 pb-5 text-center">
                        <span className="flex size-14 overflow-hidden rounded-xl bg-background ring-1 ring-border">
                            <img
                                src="/logo.png"
                                alt=""
                                className="size-14 object-cover"
                            />
                        </span>
                        <p className="text-sm font-medium">{menu.name}</p>
                        <p className="text-lg font-semibold tracking-tight">
                            {menu.menu}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-5 px-5 py-5">
                    {menu.sections.map((section) => (
                        <div key={section.name} className="flex flex-col gap-3">
                            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                {section.name}
                            </p>
                            <ul className="flex flex-col gap-3">
                                {section.products.map((product) => (
                                    <li
                                        key={product.name}
                                        className="flex items-baseline justify-between gap-4"
                                    >
                                        <span className="font-medium">
                                            {product.name}
                                        </span>
                                        <span className="shrink-0 text-sm font-medium tabular-nums">
                                            {formatMoney(product.price)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t border-border bg-muted/40 px-5 py-3 text-center text-xs text-muted-foreground">
                    Link e QR prontos para compartilhar
                </div>
            </div>
            <figcaption className="sr-only">
                Exemplo de cardápio digital com seções, preços e identidade
                visual do ambiente.
            </figcaption>
        </figure>
    );
}
