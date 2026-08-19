import type { User } from '@/types/auth';

export type WorkspaceSummary = {
    id: number;
    name: string;
    slug: string;
    role?: string;
};

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type SaleStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export type Product = {
    id: number;
    workspace_id: number;
    name: string;
    description: string | null;
    price: number;
    active: boolean;
    created_at: string;
    updated_at: string;
};

export type SaleItem = {
    id: number;
    sale_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total: number;
    product?: Pick<Product, 'id' | 'name'>;
};

export type Sale = {
    id: number;
    workspace_id: number;
    status: SaleStatus;
    total: number;
    sold_at: string;
    created_at: string;
    items?: SaleItem[];
};

export type WorkspaceMember = {
    id: number;
    workspace_id: number;
    user_id: number;
    role: WorkspaceRole;
    created_at: string;
    user: Pick<User, 'id' | 'name' | 'email'>;
};

export type WorkspaceInvitation = {
    id: number;
    workspace_id: number;
    email: string;
    role: WorkspaceRole;
    created_at: string;
    expires_at: string;
};

export type Paginated<T> = {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type AppNotification = {
    id: string;
    type: string;
    data: {
        type?: string;
        invitation_id?: number;
        token?: string;
        workspace_name?: string;
        inviter_name?: string;
        role?: string;
    };
    read_at: string | null;
    created_at: string;
};
