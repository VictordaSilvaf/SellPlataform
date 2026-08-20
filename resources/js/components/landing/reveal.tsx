import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

const hiddenClass = {
    up: 'motion-safe:translate-y-8 motion-safe:opacity-0',
    scale: 'motion-safe:translate-y-4 motion-safe:scale-[0.96] motion-safe:opacity-0',
} as const;

const visibleClass = {
    up: 'translate-y-0 opacity-100',
    scale: 'translate-y-0 scale-100 opacity-100',
} as const;

export function Reveal({
    children,
    className,
    delay = 0,
    immediate = false,
    from = 'up',
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    immediate?: boolean;
    from?: keyof typeof hiddenClass;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reducedMotion = usePrefersReducedMotion();
    const [visible, setVisible] = useState(immediate || reducedMotion);

    useEffect(() => {
        if (immediate || reducedMotion) {
            setVisible(true);

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
            { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [immediate, reducedMotion]);

    return (
        <div
            ref={ref}
            className={cn(
                'motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out',
                visible ? visibleClass[from] : hiddenClass[from],
                className,
            )}
            style={{
                transitionDelay: visible ? `${delay}ms` : undefined,
            }}
        >
            {children}
        </div>
    );
}
