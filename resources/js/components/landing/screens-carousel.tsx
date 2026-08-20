import { QrCode, ShoppingBag, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

const screens = [
    {
        title: 'Cardápio público',
        body: 'O cliente abre o link, vê fotos, seções e preços no celular.',
        icon: Store,
        items: ['Cafés', 'Salgados', 'Bebidas'],
    },
    {
        title: 'QR na mesa',
        body: 'Imprima ou mostre o código. Sem app para baixar.',
        icon: QrCode,
        items: ['Mesa 4', 'Balcão', 'Delivery'],
    },
    {
        title: 'Vendas do dia',
        body: 'Pendente, paga ou cancelada — o total aparece no dashboard.',
        icon: ShoppingBag,
        items: ['R$ 118,50', '3 vendas', 'Hoje'],
    },
];

export function ScreensCarousel() {
    const reducedMotion = usePrefersReducedMotion();
    const [index, setIndex] = useState(0);
    const last = screens.length - 1;

    useEffect(() => {
        if (reducedMotion) {
            return;
        }

        const timer = window.setInterval(() => {
            setIndex((current) => (current === last ? 0 : current + 1));
        }, 4300);

        return () => window.clearInterval(timer);
    }, [last, reducedMotion]);

    return (
        <div className="flex flex-col gap-5">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                <div
                    className="flex motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {screens.map((screen) => {
                        const Icon = screen.icon;

                        return (
                            <article
                                key={screen.title}
                                className="flex w-full shrink-0 flex-col gap-5 p-6"
                            >
                                <div className="flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                                    <Icon className="size-5" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xl font-semibold">
                                        {screen.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {screen.body}
                                    </p>
                                </div>
                                <ul className="flex flex-wrap gap-2">
                                    {screen.items.map((item) => (
                                        <li
                                            key={item}
                                            className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        );
                    })}
                </div>
            </div>
            <div className="flex gap-2">
                {screens.map((screen, slide) => (
                    <Button
                        key={screen.title}
                        type="button"
                        size="sm"
                        variant={slide === index ? 'default' : 'outline'}
                        onClick={() => setIndex(slide)}
                    >
                        {screen.title}
                    </Button>
                ))}
            </div>
        </div>
    );
}
