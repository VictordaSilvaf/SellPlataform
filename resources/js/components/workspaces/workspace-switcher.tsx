import { Link, router, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { dashboard } from '@/routes/workspace';
import { create } from '@/routes/workspaces';

export function WorkspaceSwitcher() {
    const { workspaces, currentWorkspace, can } = usePage().props;
    const [open, setOpen] = useState(false);

    if (workspaces.length === 0) {
        return (
            <Link
                href={create()}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
            >
                <Plus className="size-4" />
                Criar ambiente
            </Link>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="inline-flex max-w-[220px] items-center gap-2 rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="truncate font-medium">
                    {currentWorkspace?.name ?? 'Ambientes'}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-0">
                <Command>
                    <CommandInput placeholder="Buscar ambiente..." />
                    <CommandList>
                        <CommandEmpty>Nenhum ambiente encontrado.</CommandEmpty>
                        <CommandGroup heading="Meus ambientes">
                            {workspaces.map((workspace) => (
                                <CommandItem
                                    key={workspace.id}
                                    value={workspace.name}
                                    onSelect={() => {
                                        setOpen(false);
                                        router.visit(
                                            dashboard.url(workspace.slug),
                                        );
                                    }}
                                >
                                    {currentWorkspace?.slug ===
                                    workspace.slug ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <span className="size-4" />
                                    )}
                                    <span className="truncate">
                                        {workspace.name}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {can.createWorkspace && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        value="criar-ambiente"
                                        onSelect={() => {
                                            setOpen(false);
                                            router.visit(create.url());
                                        }}
                                    >
                                        <Plus className="size-4" />
                                        Criar ambiente
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
