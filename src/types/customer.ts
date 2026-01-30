export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  region: string;
  status: 'Prospect' | 'Active' | 'Churned' | 'Lead' | string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | string;
  last_contacted: string;
  notes: string;
  attachments: string[];
  custom_fields?: Record<string, string>;
}

export interface CustomerApiResponse {
  meta: {
    source: string;
    fetched_at: string;
    count: number;
  };
  data: Customer[];
}

export interface CustomerFilters {
  search: string;
  regions: string[];
  statuses: string[];
  tiers: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export type SortField = 'name' | 'company' | 'status' | 'last_contacted';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
