import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types';

export function Pagination({
    meta,
}: {
    meta: Pick<Paginated<unknown>, 'links'>;
}) {
    if (meta.links.length <= 3) {
        return null;
    }

    return (
        <nav className="flex flex-wrap items-center justify-center gap-1">
            {meta.links.map((link, index) => {
                const label = link.label
                    .replace('&laquo;', '«')
                    .replace('&raquo;', '»');

                if (!link.url) {
                    return (
                        <Button
                            key={`${label}-${index}`}
                            variant="ghost"
                            size="sm"
                            disabled
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Button
                        key={`${label}-${index}`}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        asChild
                    >
                        <Link
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    </Button>
                );
            })}
        </nav>
    );
}
