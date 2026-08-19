import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Package,
    Settings,
    ShoppingCart,
    UtensilsCrossed,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { edit as editProfile } from '@/routes/profile';
import { dashboard } from '@/routes/workspace';
import { index as members } from '@/routes/workspace/members';
import { index as menus } from '@/routes/workspace/menus';
import { show as plan } from '@/routes/workspace/plan';
import { index as products } from '@/routes/workspace/products';
import { index as sales } from '@/routes/workspace/sales';
import { edit as workspaceSettings } from '@/routes/workspace/settings';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { currentWorkspace, workspaces, can } = usePage().props;
    const workspace = currentWorkspace ?? workspaces[0];

    const mainNavItems: NavItem[] = workspace
        ? [
              {
                  title: 'Dashboard',
                  href: dashboard(workspace.slug),
                  icon: LayoutGrid,
              },
              {
                  title: 'Produtos',
                  href: products(workspace.slug),
                  icon: Package,
              },
              {
                  title: 'Cardápios',
                  href: menus(workspace.slug),
                  icon: UtensilsCrossed,
              },
              {
                  title: 'Vendas',
                  href: sales(workspace.slug),
                  icon: ShoppingCart,
              },
          ]
        : [];

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    workspace
                                        ? dashboard(workspace.slug)
                                        : '/workspaces/create'
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {mainNavItems.length > 0 && <NavMain items={mainNavItems} />}
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Configurações</SidebarGroupLabel>
                    <SidebarMenu>
                        {workspace &&
                            (can.manageWorkspace || can.manageBranding) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href={workspaceSettings(workspace.slug)}
                                    >
                                        <Settings />
                                        <span>Workspace</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {workspace && can.manageMembers && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={members(workspace.slug)}>
                                        <Settings />
                                        <span>Membros</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {workspace && can.manageWorkspace && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={plan(workspace.slug)}>
                                        <Settings />
                                        <span>Plano</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={editProfile()}>
                                    <Settings />
                                    <span>Conta</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
