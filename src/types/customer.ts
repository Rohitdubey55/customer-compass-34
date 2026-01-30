// Types matching the actual Google Sheet structure
export interface Lead {
  id: string;
  company: string;  // Column 1 (first empty-key column)
  leadOrigin: string;  // Phase 0
  teamType: string;  // Basic Information (Sales Team) - PIM or CM
  managementLead: string;  // Phase 1
  hasIntroMeeting: boolean;  // Push for Pilot + LOI (Management Team)
  deliveryLead: string;  // Phase 2
  hasWeeklyCalls: boolean | string;  // Pilot + Spend Rampup (Delivery Team)
  nextSteps: string;  // Next Steps / Current Progress
  info: string;  // *Info
  commodities: string;  // Additional Info
}

export interface LeadApiResponse {
  meta: {
    source: string;
    fetched_at: string;
    count: number;
  };
  data: Lead[];
}

export interface LeadFilters {
  search: string;
  leadOrigins: string[];
  teamTypes: string[];
  managementLeads: string[];
  deliveryLeads: string[];
  hasIntroMeeting: boolean | null;
}

export type SortField = 'company' | 'leadOrigin' | 'managementLead' | 'deliveryLead';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Keep old Customer type for backwards compatibility if needed
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
