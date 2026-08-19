import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { accept, reject } from '@/routes/invitations';
import type { AppNotification, Paginated } from '@/types';

export default function NotificationsIndex({
    notifications,
}: {
    notifications: Paginated<AppNotification>;
}) {
    return (
        <>
            <Head title="Notificações" />
            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
                <Heading title="Notificações" />
                {notifications.data.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Você não possui notificações.
                    </p>
                )}
                <div className="space-y-3">
                    {notifications.data.map((notification) => (
                        <div
                            key={notification.id}
                            className="rounded-lg border p-4"
                        >
                            <p className="font-medium">
                                {notification.data.inviter_name} convidou você
                                para {notification.data.workspace_name}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {new Date(
                                    notification.created_at,
                                ).toLocaleString('pt-BR')}
                            </p>
                            {notification.data.token &&
                                !notification.read_at && (
                                    <div className="mt-4 flex gap-2">
                                        <Form {...accept.form()}>
                                            <input
                                                type="hidden"
                                                name="token"
                                                value={notification.data.token}
                                            />
                                            <Button type="submit">
                                                Aceitar
                                            </Button>
                                        </Form>
                                        <Form {...reject.form()}>
                                            <input
                                                type="hidden"
                                                name="token"
                                                value={notification.data.token}
                                            />
                                            <Button
                                                type="submit"
                                                variant="outline"
                                            >
                                                Recusar
                                            </Button>
                                        </Form>
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
                <Pagination meta={notifications} />
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [{ title: 'Notificações', href: '#' }],
};
