import { Form, Head, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { destroy, update } from '@/routes/workspace/settings';
import type { WorkspaceSummary } from '@/types';

export default function WorkspaceSettings({
    workspace,
}: {
    workspace: WorkspaceSummary & { name: string };
}) {
    const { currentWorkspace } = usePage().props;

    return (
        <>
            <Head title="Workspace" />
            <div className="flex flex-col gap-8 px-4 py-8 md:px-8">
                <Heading
                    title="Workspace"
                    description="Edite o nome do ambiente ou exclua-o."
                />
                <Form
                    {...update.form(workspace.slug)}
                    className="max-w-lg space-y-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={workspace.name}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Salvar
                            </Button>
                        </>
                    )}
                </Form>
                <div className="max-w-lg rounded-lg border border-danger-soft bg-danger-soft p-4">
                    <h3 className="font-medium">Excluir ambiente</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Esta ação remove produtos, vendas e membros deste
                        ambiente.
                    </p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="mt-4">
                                Excluir workspace
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Tem certeza que deseja excluir este
                                    ambiente?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Essa operação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() =>
                                        router.delete(
                                            destroy.url(
                                                currentWorkspace?.slug ??
                                                    workspace.slug,
                                            ),
                                        )
                                    }
                                >
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </>
    );
}

WorkspaceSettings.layout = {
    breadcrumbs: [{ title: 'Workspace', href: '#' }],
};
