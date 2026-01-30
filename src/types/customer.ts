// Types matching the new Google Sheet structure
export interface Lead {
  id: string;
  customer: string;
  leadOrigin: string;
  pimOrCm: string;
  customerContact: string;
  midLevelManager: string;
  strategicOwner: string;
  managementLead: string;
  deliveryLead: string;
  introductoryMeeting: boolean;
  pptsShared: string;
  verbalAgreement: string;
  ndaSigned: string;
  loiIssued: boolean;
  loiSigned: boolean;
  lastMeeting: string;
  weeklyCalls: string;
  partsSpendReceived: string;
  nextFollowup: string;
  contractSigned: string;
  currentProgress: string;
  commodities: string;
  spend: string;
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
  pimOrCm: string[];
  managementLeads: string[];
  deliveryLeads: string[];
  strategicOwners: string[];
  hasIntroMeeting: boolean | null;
  hasLoi: boolean | null;
}

export type SortField = 'customer' | 'leadOrigin' | 'managementLead' | 'deliveryLead' | 'nextFollowup';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
