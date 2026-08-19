import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { SaleLedgerPreview } from '@/components/landing/sale-ledger-preview';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

const steps = [
    {
        title: 'Abra um ambiente',
        body: 'Cada loja, banca ou projeto fica no seu espaço. No plano Free você cria até três ambientes próprios.',
    },
    {
        title: 'Cadastre o que vende',
        body: 'Preço em reais, ativo ou pausado. A equipe usa o mesmo catálogo na hora de registrar a venda.',
    },
    {
        title: 'Lance e acompanhe',
        body: 'Venda pendente, concluída ou cancelada. O dashboard mostra o dia, o mês e o que ainda está em aberto.',
    },
];

export default function Welcome() {
    const { auth, name } = usePage().props;
    const primaryHref = auth.user ? dashboard() : register();
    const primaryLabel = auth.user ? 'Ir ao dashboard' : 'Criar conta grátis';

    return (
        <>
            <Head title="Vendas no mesmo lugar">
                <meta
                    name="description"
                    content={`${name} organiza produtos, vendas e equipe em ambientes de trabalho. Comece no plano Free.`}
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-sm">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-semibold"
                        >
                            <span className="flex size-8 overflow-hidden rounded-md">
                                <AppLogoIcon className="size-8" alt="" />
                            </span>
                            <span>{name}</span>
                        </Link>
                        <nav className="flex items-center gap-2">
                            <ThemeToggle />
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Entrar</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={register()}>
                                            Criar conta
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-24">
                        <div className="flex flex-col gap-6">
                            <h1 className="max-w-[18ch] text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-pretty">
                                A venda do balcão, registrada de verdade.
                            </h1>
                            <p className="max-w-[42ch] text-lg leading-relaxed text-pretty text-muted-foreground">
                                {name} é para quem vende no dia a dia e ainda
                                anota no caderno ou na planilha. Catálogo,
                                vendas e equipe no mesmo ambiente — sem misturar
                                lojas.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button size="lg" asChild>
                                    <Link href={primaryHref}>
                                        {primaryLabel}
                                    </Link>
                                </Button>
                                {!auth.user && (
                                    <Button size="lg" variant="outline" asChild>
                                        <Link href={login()}>
                                            Já tenho conta
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Plano Free: 3 ambientes e 3 pessoas por
                                ambiente, incluindo você.
                            </p>
                        </div>
                        <SaleLedgerPreview />
                    </section>

                    <section className="bg-primary text-primary-foreground">
                        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:py-20">
                            {steps.map((step, index) => (
                                <article
                                    key={step.title}
                                    className="flex flex-col gap-3"
                                >
                                    <p className="font-semibold tabular-nums">
                                        {String(index + 1).padStart(2, '0')}
                                    </p>
                                    <h2 className="text-xl font-semibold text-balance">
                                        {step.title}
                                    </h2>
                                    <p className="leading-relaxed text-primary-foreground/85">
                                        {step.body}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
                        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                            <div className="flex flex-col gap-4">
                                <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance">
                                    Um ambiente por loja. Convite por e-mail.
                                </h2>
                                <p className="max-w-[52ch] leading-relaxed text-pretty text-muted-foreground">
                                    Dono define quem entra. Membros vendem no
                                    catálogo da casa. Quem recebe o convite
                                    aceita ou recusa na área de notificações —
                                    sem compartilhar senha.
                                </p>
                            </div>
                            <dl className="grid gap-6 sm:grid-cols-2">
                                <div className="rounded-xl bg-card p-5 ring-1 ring-border">
                                    <dt className="text-sm text-muted-foreground">
                                        Produtos
                                    </dt>
                                    <dd className="mt-2 text-lg font-medium">
                                        Preço em reais. Pause o item quando não
                                        quiser mais vender.
                                    </dd>
                                </div>
                                <div className="rounded-xl bg-card p-5 ring-1 ring-border">
                                    <dt className="text-sm text-muted-foreground">
                                        Vendas
                                    </dt>
                                    <dd className="mt-2 text-lg font-medium">
                                        Várias unidades, total conferido, status
                                        que você marca.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    <section className="border-t border-border bg-card">
                        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center">
                            <div className="flex max-w-xl flex-col gap-3">
                                <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance">
                                    Comece com o que você já vende amanhã.
                                </h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    Cadastro rápido. Primeiro ambiente na hora.
                                    Sem cartão no plano Free.
                                </p>
                            </div>
                            <Button size="lg" asChild>
                                <Link href={primaryHref}>{primaryLabel}</Link>
                            </Button>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-border">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:px-6">
                        <span>{name}</span>
                        <span>Feito para o balcão, não para o pitch.</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
