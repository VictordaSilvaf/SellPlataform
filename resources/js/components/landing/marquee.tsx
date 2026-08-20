import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

const venues = [
    'Padaria',
    'Café',
    'Food truck',
    'Banca',
    'Restaurante',
    'Dark kitchen',
    'Bar',
    'Lanchonete',
    'Açaí',
    'Doceria',
];

export function VenueMarquee() {
    const reducedMotion = usePrefersReducedMotion();
    const items = [...venues, ...venues];

    return (
        <section
            aria-label="Tipos de negócio"
            className="overflow-hidden border-y border-border bg-card py-4"
        >
            <div
                className={cn(
                    'flex w-max gap-10 px-6 text-sm font-medium tracking-[0.12em] text-muted-foreground uppercase',
                    !reducedMotion &&
                        'animate-marquee hover:[animation-play-state:paused]',
                )}
            >
                {items.map((venue, index) => (
                    <span key={`${venue}-${index}`} className="shrink-0">
                        {venue}
                    </span>
                ))}
            </div>
        </section>
    );
}
