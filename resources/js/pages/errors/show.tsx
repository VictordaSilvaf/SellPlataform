import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { dashboard, home } from '@/routes';

const copy: Record<
    number,
    {
        title: string;
        description: string;
    }
> = {
    403: {
        title: 'Você não tem permissão',
        description:
            'Esta página existe, mas sua conta não pode acessá-la. Se achar que isso é um engano, fale com quem administra o ambiente.',
    },
    404: {
        title: 'Página não encontrada',
        description:
            'O endereço pode estar errado ou o conteúdo foi removido. Volte ao início e siga pelo menu.',
    },
    419: {
        title: 'Sessão expirada',
        description:
            'Por segurança, a página ficou velha demais. Atualize e tente de novo — seus dados de login continuam os mesmos.',
    },
    429: {
        title: 'Calma, muitas tentativas',
        description:
            'Recebemos vários pedidos seguidos. Espere um instante e tente outra vez.',
    },
    500: {
        title: 'Algo deu errado',
        description:
            'Não conseguimos concluir o que você pediu. Tente novamente em instantes. Se continuar, volte mais tarde.',
    },
    503: {
        title: 'Voltamos já',
        description:
            'O serviço está em manutenção ou temporariamente indisponível. Tente de novo daqui a pouco.',
    },
};

export default function ErrorShow({ status }: { status: number }) {
    const { auth, name } = usePage().props;
    const content = copy[status] ?? copy[500];
    const homeHref = auth.user ? dashboard() : home();
    const homeLabel = auth.user ? 'Ir ao dashboard' : 'Voltar ao início';

    return (
        <>
            <Head title={content.title} />
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="border-b border-border/80">
                    <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
                        <Link
                            href={home()}
                            className="flex items-center gap-2 font-semibold"
                        >
                            <span className="flex size-8 overflow-hidden rounded-md">
                                <AppLogoIcon className="size-8" alt="" />
                            </span>
                            <span>{name}</span>
                        </Link>
                        <ThemeToggle />
                    </div>
                </header>
                <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-16 sm:px-6">
                    <p className="text-sm font-medium text-muted-foreground">
                        Erro {status}
                    </p>
                    <h1 className="max-w-[18ch] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-pretty">
                        {content.title}
                    </h1>
                    <p className="max-w-[46ch] text-lg leading-relaxed text-pretty text-muted-foreground">
                        {content.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button size="lg" asChild>
                            <Link href={homeHref}>{homeLabel}</Link>
                        </Button>
                    </div>
                </main>
            </div>
        </>
    );
}
