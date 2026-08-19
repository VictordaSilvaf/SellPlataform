import type { Auth } from '@/types/auth';
import type { WorkspaceSummary } from '@/types/models';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            workspaces: WorkspaceSummary[];
            currentWorkspace: WorkspaceSummary | null;
            currentRole: string | null;
            unreadNotificationsCount: number;
            can: {
                manageWorkspace: boolean;
                manageMembers: boolean;
                manageProducts: boolean;
                manageSales: boolean;
                createSales: boolean;
                viewReports: boolean;
                createWorkspace: boolean;
            };
            [key: string]: unknown;
        };
    }
}
