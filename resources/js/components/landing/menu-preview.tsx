import { formatMoney } from '@/lib/money';

const workspace = {
    name: 'Café da Esquina',
    menu: 'Cardápio do dia',
};

const sections = [
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
];

export function MenuPreview() {
    return (
        <figure className="relative mx-auto w-full max-w-md motion-safe:origin-bottom-right motion-safe:rotate-2">
            <div
                aria-hidden
                className="absolute -inset-6 rounded-[1.25rem] bg-primary/15 blur-2xl dark:bg-primary/25"
            />
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
                <div className="relative aspect-video bg-primary-soft">
                    <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 bg-linear-to-t from-background via-background/40 to-transparent px-5 pb-5 text-center">
                        <span className="flex size-14 overflow-hidden rounded-xl bg-background ring-1 ring-border">
                            <img
                                src="/logo.png"
                                alt=""
                                className="size-14 object-cover"
                            />
                        </span>
                        <p className="text-sm font-medium">{workspace.name}</p>
                        <p className="text-lg font-semibold tracking-tight">
                            {workspace.menu}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-5 px-5 py-5">
                    {sections.map((section) => (
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
