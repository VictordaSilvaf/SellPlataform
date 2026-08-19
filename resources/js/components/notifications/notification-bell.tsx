import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { index as notifications } from '@/routes/notifications';

export function NotificationBell() {
    const { unreadNotificationsCount } = usePage().props;

    return (
        <Button variant="ghost" size="icon" asChild className="relative">
            <Link href={notifications()} aria-label="Notificações">
                <Bell className="size-4" />
                {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium text-white">
                        {unreadNotificationsCount}
                    </span>
                )}
            </Link>
        </Button>
    );
}
