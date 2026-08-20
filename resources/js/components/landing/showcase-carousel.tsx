import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { featuredMenus, MenuPreview } from '@/components/landing/menu-preview';
import { Button } from '@/components/ui/button';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

export function ShowcaseCarousel() {
    const reducedMotion = usePrefersReducedMotion();
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const last = featuredMenus.length - 1;

    useEffect(() => {
        if (reducedMotion || paused) {
            return;
        }

        const timer = window.setInterval(() => {
            setIndex((current) => (current === last ? 0 : current + 1));
        }, 5200);

        return () => window.clearInterval(timer);
    }, [last, paused, reducedMotion]);

    const goTo = (next: number): void => {
        setIndex((next + featuredMenus.length) % featuredMenus.length);
    };

    return (
        <div
            className="flex flex-col gap-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="overflow-hidden">
                <div
                    className="flex motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {featuredMenus.map((menu) => (
                        <div
                            key={menu.name}
                            className="w-full shrink-0 px-1"
                            aria-hidden={
                                menu.name !== featuredMenus[index]?.name
                            }
                        >
                            <MenuPreview menu={menu} tilted={false} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Cardápio anterior"
                    onClick={() => goTo(index - 1)}
                >
                    <ChevronLeft />
                </Button>
                <div className="flex gap-2">
                    {featuredMenus.map((menu, slide) => (
                        <button
                            key={menu.name}
                            type="button"
                            aria-label={`Ver ${menu.name}`}
                            aria-current={slide === index}
                            className={cn(
                                'size-2.5 rounded-full motion-safe:transition-colors',
                                slide === index
                                    ? 'bg-primary'
                                    : 'bg-border hover:bg-muted-foreground/40',
                            )}
                            onClick={() => goTo(slide)}
                        />
                    ))}
                </div>
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Próximo cardápio"
                    onClick={() => goTo(index + 1)}
                >
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
}
