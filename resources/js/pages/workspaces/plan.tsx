import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PlanProps = {
    plan: {
        name: string;
        max_workspaces: number;
        max_members: number;
        max_menus: number | null;
        owned_workspaces: number;
        current_members: number;
        current_menus: number;
    };
};

export default function WorkspacePlan({ plan }: PlanProps) {
    return (
        <>
            <Head title="Plano" />
            <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
                <Heading
                    title="Plano"
                    description="Seu plano atual e os limites do ambiente."
                />
                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>
                            Ambientes próprios: {plan.owned_workspaces} /{' '}
                            {plan.max_workspaces}
                        </p>
                        <p>
                            Membros neste ambiente: {plan.current_members} /{' '}
                            {plan.max_members}
                        </p>
                        <p>
                            Cardápios neste ambiente: {plan.current_menus} /{' '}
                            {plan.max_menus === null
                                ? 'Ilimitado'
                                : plan.max_menus}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

WorkspacePlan.layout = {
    breadcrumbs: [{ title: 'Plano', href: '#' }],
};
