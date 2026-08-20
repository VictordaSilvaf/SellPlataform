import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

export function Parallax({
    children,
    className,
    speed = 0.18,
}: {
    children?: ReactNode;
    className?: string;
    speed?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reducedMotion = usePrefersReducedMotion();
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        if (reducedMotion) {
            setOffset(0);

            return;
        }

        let frame = 0;

        const update = (): void => {
            const node = ref.current;

            if (!node) {
                return;
            }

            const rect = node.getBoundingClientRect();
            const center = rect.top + rect.height / 2 - window.innerHeight / 2;

            setOffset(center * speed);
        };

        const onScroll = (): void => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [reducedMotion, speed]);

    const style: CSSProperties | undefined = reducedMotion
        ? undefined
        : { transform: `translate3d(0, ${offset.toFixed(1)}px, 0)` };

    return (
        <div
            ref={ref}
            className={cn('will-change-transform', className)}
            style={style}
        >
            {children}
        </div>
    );
}
