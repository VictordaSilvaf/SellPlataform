import { Head, usePage } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Parallax } from '@/components/landing/parallax';
import { Reveal } from '@/components/landing/reveal';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { SectionImageSide } from '@/types';

type PublicProduct = {
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
};

type PublicSection = {
    name: string;
    description: string | null;
    background_color: string;
    image_url: string | null;
    image_side: SectionImageSide;
    products: PublicProduct[];
};

function contrastText(hex: string): string {
    const value = hex.replace('#', '');
    const r = Number.parseInt(value.slice(0, 2), 16);
    const g = Number.parseInt(value.slice(2, 4), 16);
    const b = Number.parseInt(value.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.62 ? '#1a1a1a' : '#f5f5f0';
}

function mutedText(hex: string): string {
    return contrastText(hex) === '#1a1a1a'
        ? 'rgba(26,26,26,0.65)'
        : 'rgba(245,245,240,0.72)';
}

function WaveDivider({ fill, flip = false }: Readonly<{ fill: string; flip?: boolean }>) {
    return (
        <div
            className={cn(
                'pointer-events-none relative z-10 -mt-px h-8 w-full overflow-hidden sm:h-10',
                flip && 'rotate-180',
            )}
            aria-hidden
        >
            <svg
                viewBox="0 0 1440 80"
                preserveAspectRatio="none"
                className="block h-full w-full"
            >
                <path
                    d="M0,48 C180,8 360,72 540,40 C720,8 900,64 1080,36 C1260,8 1350,48 1440,24 L1440,80 L0,80 Z"
                    fill={fill}
                />
            </svg>
        </div>
    );
}

function ProductRow({
    product,
    color,
}: Readonly<{
    product: PublicProduct;
    color: string;
}>) {
    const text = contrastText(color);
    const soft = mutedText(color);

    return (
        <li className="py-3">
            <div className="flex items-baseline gap-3">
                <h3
                    className="max-w-[65%] shrink-0 text-base font-medium tracking-wide"
                    style={{ color: text }}
                >
                    {product.name}
                </h3>
                <span
                    className="mb-1 min-w-4 flex-1 border-b border-dotted"
                    style={{ borderColor: soft }}
                    aria-hidden
                />
                <p
                    className="shrink-0 text-sm font-medium tabular-nums"
                    style={{ color: text }}
                >
                    {formatMoney(product.price)}
                </p>
            </div>
            {product.description && (
                <p className="mt-1 max-w-prose text-sm" style={{ color: soft }}>
                    {product.description}
                </p>
            )}
        </li>
    );
}

function SectionBlock({
    section,
    nextColor,
    isLast,
}: Readonly<{
    section: PublicSection;
    nextColor: string;
    isLast: boolean;
}>) {
    const text = contrastText(section.background_color);
    const soft = mutedText(section.background_color);
    const imageOnRight = section.image_side === 'RIGHT';

    return (
        <section
            className="relative"
            style={{ backgroundColor: section.background_color }}
        >
            <div
                className={cn(
                    'mx-auto grid max-w-6xl items-stretch gap-0 md:grid-cols-2',
                    imageOnRight && 'md:[&>*:first-child]:order-2',
                )}
            >
                <div className="relative min-h-56 overflow-hidden md:min-h-[28rem]">
                    {section.image_url ? (
                        <Parallax speed={0.14} className="absolute inset-0">
                            <img
                                src={section.image_url}
                                alt=""
                                className="size-full object-cover motion-safe:animate-menu-cover"
                            />
                        </Parallax>
                    ) : (
                        <div
                            className="flex size-full items-center justify-center opacity-40"
                            style={{ color: soft }}
                        >
                            <span className="text-sm tracking-[0.2em] uppercase">
                                {section.name}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:py-14">
                    <Reveal>
                        <h2
                            className="font-menu-script text-4xl leading-none sm:text-5xl"
                            style={{ color: text }}
                        >
                            {section.name}
                        </h2>
                        {section.description && (
                            <p
                                className="mt-3 max-w-prose text-sm leading-relaxed"
                                style={{ color: soft }}
                            >
                                {section.description}
                            </p>
                        )}
                    </Reveal>
                    <ul className="mt-8 divide-y" style={{ borderColor: soft }}>
                        {section.products.map((product, index) => (
                            <Reveal
                                key={`${section.name}-${product.name}-${index}`}
                                from="scale"
                                delay={index < 4 ? 60 * (index + 1) : 0}
                            >
                                <ProductRow
                                    product={product}
                                    color={section.background_color}
                                />
                            </Reveal>
                        ))}
                    </ul>
                </div>
            </div>
            {!isLast && <WaveDivider fill={nextColor} />}
        </section>
    );
}

export default function PublicMenu({
    available,
    workspace,
    menu,
    unsectioned,
    sections,
}: Readonly<{
    available: boolean;
    workspace: {
        name: string;
        logo_url: string | null;
    };
    menu: {
        name: string;
        description: string | null;
        banner_url: string | null;
        banner_color: string;
    };
    unsectioned: PublicProduct[];
    sections: PublicSection[];
}>) {
    const { name } = usePage().props;
    const empty = unsectioned.length === 0 && sections.length === 0;
    const bannerText = contrastText(menu.banner_color);
    const bannerSoft = mutedText(menu.banner_color);
    const firstSectionColor =
        sections[0]?.background_color ?? menu.banner_color;

    return (
        <>
            <Head title={available ? menu.name : 'Cardápio indisponível'}>
                <meta
                    name="description"
                    content={
                        menu.description ??
                        `Cardápio de ${workspace.name} no ${name}.`
                    }
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Source+Sans+3:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div
                className="min-h-screen font-[family-name:var(--font-menu-body)] text-foreground"
                style={
                    {
                        '--font-menu-body':
                            "'Source Sans 3', ui-sans-serif, system-ui, sans-serif",
                        '--font-menu-script': "'Great Vibes', cursive",
                        backgroundColor: menu.banner_color,
                    } as CSSProperties
                }
            >
                <header className="absolute top-0 right-0 z-20 px-4 py-3">
                    <ThemeToggle />
                </header>
                <main>
                    <header
                        className="relative overflow-hidden"
                        style={{ backgroundColor: menu.banner_color }}
                    >
                        {menu.banner_url ? (
                            <div className="relative min-h-[48vh] sm:min-h-[56vh]">
                                <Parallax
                                    speed={0.22}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={menu.banner_url}
                                        alt=""
                                        className="size-full object-cover motion-safe:animate-menu-cover"
                                    />
                                </Parallax>
                                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-black/10" />
                                <div className="relative z-10 flex min-h-[48vh] flex-col justify-between px-6 py-8 sm:min-h-[56vh] sm:px-10">
                                    <div className="flex items-center gap-3 motion-safe:animate-menu-rise">
                                        <span className="flex size-14 overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm sm:size-16">
                                            {workspace.logo_url ? (
                                                <img
                                                    src={workspace.logo_url}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <AppLogoIcon
                                                    className="size-full p-2 text-white"
                                                    alt=""
                                                />
                                            )}
                                        </span>
                                    </div>
                                    <div className="pb-6">
                                        <p className="text-sm font-medium tracking-[0.18em] text-white/80 uppercase motion-safe:animate-menu-rise motion-safe:[animation-delay:90ms]">
                                            {workspace.name}
                                        </p>
                                        <h1 className="mt-2 font-menu-script text-5xl text-white sm:text-6xl motion-safe:animate-menu-rise motion-safe:[animation-delay:160ms]">
                                            {available
                                                ? menu.name
                                                : 'Cardápio indisponível'}
                                        </h1>
                                        {available && menu.description && (
                                            <p className="mt-3 max-w-xl text-pretty text-white/80 motion-safe:animate-menu-rise motion-safe:[animation-delay:240ms]">
                                                {menu.description}
                                            </p>
                                        )}
                                        {!available && (
                                            <p className="mt-3 max-w-xl text-pretty text-white/80 motion-safe:animate-menu-rise motion-safe:[animation-delay:240ms]">
                                                Este cardápio não está
                                                disponível no momento.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-[42vh] flex-col items-center justify-center px-6 py-16 text-center sm:min-h-[48vh]">
                                <span className="mb-4 flex size-16 overflow-hidden rounded-xl bg-white/10 motion-safe:animate-menu-rise sm:size-20">
                                    {workspace.logo_url ? (
                                        <img
                                            src={workspace.logo_url}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <AppLogoIcon
                                            className="size-full p-3"
                                            style={{ color: bannerText }}
                                            alt=""
                                        />
                                    )}
                                </span>
                                <p
                                    className="text-sm font-medium tracking-[0.18em] uppercase motion-safe:animate-menu-rise motion-safe:[animation-delay:90ms]"
                                    style={{ color: bannerSoft }}
                                >
                                    {workspace.name}
                                </p>
                                <h1
                                    className="mt-3 font-menu-script text-5xl sm:text-6xl motion-safe:animate-menu-rise motion-safe:[animation-delay:160ms]"
                                    style={{ color: bannerText }}
                                >
                                    {available
                                        ? menu.name
                                        : 'Cardápio indisponível'}
                                </h1>
                                {available ? (
                                    menu.description && (
                                        <p
                                            className="mt-4 max-w-[40ch] text-pretty motion-safe:animate-menu-rise motion-safe:[animation-delay:240ms]"
                                            style={{ color: bannerSoft }}
                                        >
                                            {menu.description}
                                        </p>
                                    )
                                ) : (
                                    <p
                                        className="mt-4 max-w-[40ch] text-pretty motion-safe:animate-menu-rise motion-safe:[animation-delay:240ms]"
                                        style={{ color: bannerSoft }}
                                    >
                                        Este cardápio não está disponível no
                                        momento.
                                    </p>
                                )}
                            </div>
                        )}
                        {available && !empty && (
                            <WaveDivider fill={firstSectionColor} />
                        )}
                    </header>

                    {available && (
                        <>
                            {empty && (
                                <div className="px-6 py-16 text-center">
                                    <Reveal>
                                        <p style={{ color: bannerSoft }}>
                                            Nenhum produto disponível agora.
                                        </p>
                                    </Reveal>
                                </div>
                            )}
                            {unsectioned.length > 0 && (
                                <section
                                    className="relative px-6 py-12 sm:px-10"
                                    style={{
                                        backgroundColor: menu.banner_color,
                                    }}
                                >
                                    <ul className="mx-auto max-w-xl">
                                        {unsectioned.map((product, index) => (
                                            <Reveal
                                                key={`${product.name}-${product.price}-${index}`}
                                                from="scale"
                                                delay={
                                                    index < 4
                                                        ? 70 * (index + 1)
                                                        : 0
                                                }
                                            >
                                                <ProductRow
                                                    product={product}
                                                    color={menu.banner_color}
                                                />
                                            </Reveal>
                                        ))}
                                    </ul>
                                    {sections.length > 0 && (
                                        <WaveDivider
                                            fill={
                                                sections[0].background_color
                                            }
                                        />
                                    )}
                                </section>
                            )}
                            {sections.map((section, index) => (
                                <SectionBlock
                                    key={`${section.name}-${index}`}
                                    section={section}
                                    nextColor={
                                        sections[index + 1]
                                            ?.background_color ??
                                        section.background_color
                                    }
                                    isLast={index === sections.length - 1}
                                />
                            ))}
                        </>
                    )}
                </main>
            </div>
        </>
    );
}
