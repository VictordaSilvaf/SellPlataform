import { Form, Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/workspaces';

export default function CreateWorkspace({ canCreate }: { canCreate: boolean }) {
    const { workspaces } = usePage().props;

    return (
        <>
            <Head title="Criar ambiente" />
            <div className="mx-auto max-w-lg px-4 py-8 md:px-8">
                <Heading
                    title="Criar ambiente"
                    description="Crie um espaço de trabalho para cadastrar produtos e registrar vendas."
                />
                {!canCreate ? (
                    <p className="text-sm text-destructive">
                        Você atingiu o limite de 3 ambientes do plano Free.
                    </p>
                ) : (
                    <Form {...store.form()} className="space-y-4">
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="Minha Loja"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Criar ambiente
                                </Button>
                            </>
                        )}
                    </Form>
                )}
                {workspaces.length > 0 && (
                    <p className="mt-6 text-sm text-muted-foreground">
                        Você já participa de {workspaces.length} ambiente(s).
                    </p>
                )}
            </div>
        </>
    );
}

CreateWorkspace.layout = {
    breadcrumbs: [{ title: 'Criar ambiente', href: '/workspaces/create' }],
};
