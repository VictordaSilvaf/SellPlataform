import { Form, Head, Link, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index, store } from '@/routes/workspace/menus';

export default function MenusCreate() {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';

    return (
        <>
            <Head title="Novo cardápio" />
            <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 md:px-8">
                <Heading
                    title="Novo cardápio"
                    description="Dê um nome para a vitrine que seus clientes vão ver."
                />
                <Form
                    action={store.url(slug)}
                    method="post"
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Cardápio Principal"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="Os melhores produtos para você"
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Criar cardápio
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={index.url(slug)}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

MenusCreate.layout = {
    breadcrumbs: [
        { title: 'Cardápios', href: '#' },
        { title: 'Novo', href: '#' },
    ],
};
