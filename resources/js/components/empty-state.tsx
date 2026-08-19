import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
            <Icon className="mb-4 size-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {description}
            </p>
            {actionLabel && actionHref && (
                <Button asChild className="mt-6">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    );
}
