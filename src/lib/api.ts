import { Customer, CustomerApiResponse } from '@/types/customer';

const API_URL = 'https://script.google.com/macros/s/AKfycbwsIP0OipyJRA6uG6dmvMO4RdiOSegyVOaIfXovR0HJpyRnlq0DmzLG1Bh0GtEishLvtA/exec';
const CACHE_KEY = 'customers_v1';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CachedData {
  data: CustomerApiResponse;
  cachedAt: number;
}

function getCachedData(): CachedData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as CachedData;
  } catch {
    return null;
  }
}

function setCachedData(data: CustomerApiResponse): void {
  try {
    const cacheEntry: CachedData = {
      data,
      cachedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (e) {
    console.warn('Failed to cache customer data:', e);
  }
}

function isCacheValid(cached: CachedData): boolean {
  return Date.now() - cached.cachedAt < CACHE_TTL_MS;
}

export function getLastUpdatedTime(): Date | null {
  const cached = getCachedData();
  if (!cached) return null;
  return new Date(cached.cachedAt);
}

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        return response;
      }
      
      // Don't retry on client errors
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Mock data for development (since Apps Script may have CORS issues)
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c_00001',
    name: 'Amit Gupta',
    company: 'ACME Industries',
    email: 'amit.gupta@acme.com',
    phone: '+91-9876543210',
    region: 'North India',
    status: 'Prospect',
    tier: 'Tier 1',
    last_contacted: '2026-01-15',
    notes: 'Interested in tariff optimization. Follow up Q1.',
    attachments: ['https://drive.google.com/file1'],
    custom_fields: { commodity: 'ALHPDC', lead_source: 'LinkedIn Campaign' }
  },
  {
    id: 'c_00002',
    name: 'Priya Sharma',
    company: 'TechCorp Solutions',
    email: 'priya.sharma@techcorp.io',
    phone: '+91-9123456789',
    region: 'South India',
    status: 'Active',
    tier: 'Tier 1',
    last_contacted: '2026-01-28',
    notes: 'Renewed annual contract. Very satisfied with service.',
    attachments: [],
    custom_fields: { commodity: 'Steel', lead_source: 'Referral' }
  },
  {
    id: 'c_00003',
    name: 'Rajesh Kumar',
    company: 'Global Exports Ltd',
    email: 'rajesh@globalexports.com',
    phone: '+91-8765432109',
    region: 'West India',
    status: 'Lead',
    tier: 'Tier 2',
    last_contacted: '2026-01-20',
    notes: 'Initial discovery call completed. Scheduling demo.',
    attachments: [],
    custom_fields: { commodity: 'Textiles', lead_source: 'Trade Show' }
  },
  {
    id: 'c_00004',
    name: 'Sunita Patel',
    company: 'Green Energy Co',
    email: 'sunita.patel@greenenergy.in',
    phone: '+91-7654321098',
    region: 'West India',
    status: 'Active',
    tier: 'Tier 1',
    last_contacted: '2026-01-25',
    notes: 'Expanding to solar panel imports. High potential.',
    attachments: ['https://drive.google.com/file2'],
    custom_fields: { commodity: 'Solar Panels', lead_source: 'Website' }
  },
  {
    id: 'c_00005',
    name: 'Vikram Singh',
    company: 'Steel Masters India',
    email: 'vikram@steelmasters.co.in',
    phone: '+91-6543210987',
    region: 'North India',
    status: 'Churned',
    tier: 'Tier 3',
    last_contacted: '2025-12-10',
    notes: 'Lost to competitor. Price sensitivity issue.',
    attachments: [],
    custom_fields: { commodity: 'Steel', lead_source: 'Cold Call' }
  },
  {
    id: 'c_00006',
    name: 'Meera Nair',
    company: 'Spice Route Trading',
    email: 'meera@spiceroute.com',
    phone: '+91-5432109876',
    region: 'South India',
    status: 'Prospect',
    tier: 'Tier 2',
    last_contacted: '2026-01-22',
    notes: 'Interested in bulk spice export documentation.',
    attachments: [],
    custom_fields: { commodity: 'Spices', lead_source: 'Partner Referral' }
  },
  {
    id: 'c_00007',
    name: 'Arjun Reddy',
    company: 'Pharma Express',
    email: 'arjun.reddy@pharmaexpress.in',
    phone: '+91-4321098765',
    region: 'South India',
    status: 'Active',
    tier: 'Tier 1',
    last_contacted: '2026-01-27',
    notes: 'Key account. Quarterly review scheduled for Feb.',
    attachments: ['https://drive.google.com/file3', 'https://drive.google.com/file4'],
    custom_fields: { commodity: 'Pharmaceuticals', lead_source: 'Industry Event' }
  },
  {
    id: 'c_00008',
    name: 'Kavitha Menon',
    company: 'Textile Hub',
    email: 'kavitha@textilehub.co',
    phone: '+91-3210987654',
    region: 'East India',
    status: 'Lead',
    tier: 'Tier 2',
    last_contacted: '2026-01-18',
    notes: 'New inquiry for cotton export compliance.',
    attachments: [],
    custom_fields: { commodity: 'Cotton', lead_source: 'Website' }
  },
  {
    id: 'c_00009',
    name: 'Deepak Joshi',
    company: 'Auto Parts Global',
    email: 'deepak@autopartsglobal.com',
    phone: '+91-2109876543',
    region: 'North India',
    status: 'Active',
    tier: 'Tier 2',
    last_contacted: '2026-01-24',
    notes: 'Expanding into electric vehicle parts.',
    attachments: [],
    custom_fields: { commodity: 'Auto Parts', lead_source: 'LinkedIn' }
  },
  {
    id: 'c_00010',
    name: 'Anita Desai',
    company: 'Handicraft Exports',
    email: 'anita@handicraftexports.in',
    phone: '+91-1098765432',
    region: 'East India',
    status: 'Prospect',
    tier: 'Tier 3',
    last_contacted: '2026-01-12',
    notes: 'Small business looking to start exporting.',
    attachments: [],
    custom_fields: { commodity: 'Handicrafts', lead_source: 'Google Ads' }
  },
  {
    id: 'c_00011',
    name: 'Rohit Verma',
    company: 'Chemical Solutions India',
    email: 'rohit.verma@chemsolutions.in',
    phone: '+91-9988776655',
    region: 'West India',
    status: 'Active',
    tier: 'Tier 1',
    last_contacted: '2026-01-29',
    notes: 'Major client. Discussing expansion into Middle East.',
    attachments: ['https://drive.google.com/file5'],
    custom_fields: { commodity: 'Chemicals', lead_source: 'Referral' }
  },
  {
    id: 'c_00012',
    name: 'Sneha Kapoor',
    company: 'Fashion Forward Exports',
    email: 'sneha@fashionforward.co',
    phone: '+91-8877665544',
    region: 'North India',
    status: 'Lead',
    tier: 'Tier 2',
    last_contacted: '2026-01-21',
    notes: 'Interested in apparel export to Europe.',
    attachments: [],
    custom_fields: { commodity: 'Apparel', lead_source: 'Trade Show' }
  }
];

export async function fetchCustomers(forceRefresh = false): Promise<CustomerApiResponse> {
  // Check cache first
  if (!forceRefresh) {
    const cached = getCachedData();
    if (cached && isCacheValid(cached)) {
      return cached.data;
    }
  }

  try {
    const response = await fetchWithRetry(API_URL);
    const text = await response.text();
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(text) as CustomerApiResponse;
      setCachedData(data);
      return data;
    } catch {
      // If parsing fails, the response might be HTML or other format
      // Fall back to cached data or mock data
      console.warn('API returned non-JSON response, using fallback data');
      const cached = getCachedData();
      if (cached) return cached.data;
      
      // Return mock data as fallback
      const mockResponse: CustomerApiResponse = {
        meta: {
          source: 'mock-data',
          fetched_at: new Date().toISOString(),
          count: MOCK_CUSTOMERS.length
        },
        data: MOCK_CUSTOMERS
      };
      setCachedData(mockResponse);
      return mockResponse;
    }
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    
    // Try to return cached data even if expired
    const cached = getCachedData();
    if (cached) {
      console.log('Returning stale cached data');
      return cached.data;
    }
    
    // Return mock data as last resort
    console.log('Using mock data as fallback');
    const mockResponse: CustomerApiResponse = {
      meta: {
        source: 'mock-data',
        fetched_at: new Date().toISOString(),
        count: MOCK_CUSTOMERS.length
      },
      data: MOCK_CUSTOMERS
    };
    setCachedData(mockResponse);
    return mockResponse;
  }
}

export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
