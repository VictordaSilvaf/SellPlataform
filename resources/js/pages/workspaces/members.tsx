import { Form, Head, router, usePage } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    destroy as destroyInvitation,
    resend,
} from '@/routes/workspace/invitations';
import { store, update, destroy } from '@/routes/workspace/members';
import type { WorkspaceInvitation, WorkspaceMember } from '@/types';

type RoleOption = { value: string; label: string };

export default function WorkspaceMembers({
    members: memberList,
    invitations,
    assignableRoles,
    canInvite,
}: {
    members: WorkspaceMember[];
    invitations: WorkspaceInvitation[];
    assignableRoles: RoleOption[];
    canInvite: boolean;
}) {
    const { currentWorkspace } = usePage().props;
    const slug = currentWorkspace?.slug ?? '';

    return (
        <>
            <Head title="Membros" />
            <div className="flex flex-col gap-8 px-4 py-8 md:px-8">
                <Heading
                    title="Membros"
                    description="Convide pessoas para trabalhar neste ambiente."
                />
                {canInvite && (
                    <Form
                        {...store.form(slug)}
                        className="grid max-w-xl gap-4 sm:grid-cols-[1fr_160px_auto]"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="pessoa@email.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Função</Label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="h-9 rounded-md border bg-transparent px-2 text-sm"
                                        defaultValue="MEMBER"
                                    >
                                        {assignableRoles.map((role) => (
                                            <option
                                                key={role.value}
                                                value={role.value}
                                            >
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" disabled={processing}>
                                        Convidar usuário
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                )}
                {memberList.length === 1 && (
                    <EmptyState
                        icon={UserPlus}
                        title="Nenhum membro adicional."
                        description="Convide pessoas para trabalhar neste ambiente."
                    />
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {memberList.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.user.name}</TableCell>
                                <TableCell>{member.user.email}</TableCell>
                                <TableCell>
                                    {member.role === 'OWNER' ? (
                                        'Proprietário'
                                    ) : (
                                        <select
                                            className="h-9 rounded-md border bg-transparent px-2 text-sm"
                                            defaultValue={member.role}
                                            onChange={(event) =>
                                                router.patch(
                                                    update.url({
                                                        workspace: slug,
                                                        member: member.id,
                                                    }),
                                                    {
                                                        role: event.target
                                                            .value,
                                                    },
                                                )
                                            }
                                        >
                                            {assignableRoles.map((role) => (
                                                <option
                                                    key={role.value}
                                                    value={role.value}
                                                >
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {member.role !== 'OWNER' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                router.delete(
                                                    destroy.url({
                                                        workspace: slug,
                                                        member: member.id,
                                                    }),
                                                )
                                            }
                                        >
                                            Remover
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div>
                    <h3 className="mb-3 text-base font-semibold">
                        Convites pendentes
                    </h3>
                    {invitations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Nenhum convite pendente.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead>Enviado</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell>
                                            {invitation.email}
                                        </TableCell>
                                        <TableCell>{invitation.role}</TableCell>
                                        <TableCell>
                                            {new Date(
                                                invitation.created_at,
                                            ).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    router.post(
                                                        resend.url({
                                                            workspace: slug,
                                                            invitation:
                                                                invitation.id,
                                                        }),
                                                    )
                                                }
                                            >
                                                Reenviar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    router.delete(
                                                        destroyInvitation.url({
                                                            workspace: slug,
                                                            invitation:
                                                                invitation.id,
                                                        }),
                                                    )
                                                }
                                            >
                                                Cancelar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </>
    );
}

WorkspaceMembers.layout = {
    breadcrumbs: [{ title: 'Membros', href: '#' }],
};
