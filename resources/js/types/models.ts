import type { User } from '@/types/auth';

export type WorkspaceSummary = {
    id: number;
    name: string;
    slug: string;
    role?: string;
    logo_url?: string | null;
};

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type SaleStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export type MenuStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export type Menu = {
    id: number;
    name: string;
    slug: string;
    status: MenuStatus;
    products_count: number;
    public_url: string;
};

export type MenuSection = {
    id: number;
    name: string;
    description: string | null;
    active: boolean;
    position: number;
    items: MenuProductItem[];
};

export type MenuProductItem = {
    id: number;
    product_id: number;
    menu_section_id: number | null;
    name: string;
    description: string | null;
    price: number;
    product_active: boolean;
    active: boolean;
    position: number;
    image_url: string | null;
};

export type Product = {
    id: number;
    workspace_id: number;
    name: string;
    description: string | null;
    price: number;
    active: boolean;
    image_url?: string | null;
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
