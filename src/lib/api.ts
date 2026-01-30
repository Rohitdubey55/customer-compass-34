import { Lead, LeadApiResponse } from '@/types/customer';

const API_URL = 'https://script.google.com/macros/s/AKfycbypx_E-8wEvZc0os8z1ujejISPfTaG3MZHTEUeC2ABpZIKtPit6jJ5GQJxg0Zuy8abDxA/exec';
const CACHE_KEY = 'leads_v3';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CachedData {
  data: LeadApiResponse;
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

function setCachedData(data: LeadApiResponse): void {
  try {
    const cacheEntry: CachedData = {
      data,
      cachedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (e) {
    console.warn('Failed to cache lead data:', e);
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

// Transform raw sheet data to Lead objects
interface RawSheetRow {
  'Customer': string;
  'Lead Origin': string;
  'PIM or CM': string;
  'Customer Point of Contact': string;
  'Mid Level Manager (Customer)': string;
  'Strategic Owner': string;
  'Management Lead': string;
  'Delivery Lead': string;
  'Introductory Meeting': boolean;
  'PPTs Shared': string;
  'Verbal Agreement': string;
  'NDA Signed': string;
  'LOI Issued': boolean;
  'LOI Signed': boolean;
  'Last Meeting': string;
  'Weekly savings production call': string;
  'Parts & Spend Received': string;
  'Next Followup Meeting': string;
  'Contract Signed': string;
  'Current Progress': string;
  'Commodities': string;
  'Spend': string;
}

function transformSheetData(rawData: RawSheetRow[]): Lead[] {
  return rawData
    .map((row, index) => ({
      id: `lead_${index + 1}`,
      customer: (row['Customer'] || '').trim(),
      leadOrigin: row['Lead Origin'] || '',
      pimOrCm: row['PIM or CM'] || '',
      customerContact: row['Customer Point of Contact'] || '',
      midLevelManager: row['Mid Level Manager (Customer)'] || '',
      strategicOwner: row['Strategic Owner'] || '',
      managementLead: row['Management Lead'] || '',
      deliveryLead: row['Delivery Lead'] || '',
      introductoryMeeting: row['Introductory Meeting'] === true,
      pptsShared: row['PPTs Shared'] || '',
      verbalAgreement: row['Verbal Agreement'] || '',
      ndaSigned: row['NDA Signed'] || '',
      loiIssued: row['LOI Issued'] === true,
      loiSigned: row['LOI Signed'] === true,
      lastMeeting: row['Last Meeting'] || '',
      weeklyCalls: row['Weekly savings production call'] || '',
      partsSpendReceived: row['Parts & Spend Received'] || '',
      nextFollowup: row['Next Followup Meeting'] || '',
      contractSigned: row['Contract Signed'] || '',
      currentProgress: row['Current Progress'] || '',
      commodities: row['Commodities'] || '',
      spend: row['Spend'] || '',
    }))
    // Filter out completely empty rows
    .filter(lead => lead.customer);
}

export async function fetchLeads(forceRefresh = false): Promise<LeadApiResponse> {
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
    
    try {
      const rawData = JSON.parse(text);
      
      // Check if it's an array (raw sheet data) or already formatted
      if (Array.isArray(rawData)) {
        const leads = transformSheetData(rawData as RawSheetRow[]);
        const apiResponse: LeadApiResponse = {
          meta: {
            source: 'google-sheet',
            fetched_at: new Date().toISOString(),
            count: leads.length
          },
          data: leads
        };
        setCachedData(apiResponse);
        return apiResponse;
      } else if (rawData.data) {
        // Already in expected format
        setCachedData(rawData);
        return rawData;
      } else {
        throw new Error('Unexpected data format');
      }
    } catch (parseError) {
      console.warn('Failed to parse API response:', parseError);
      const cached = getCachedData();
      if (cached) return cached.data;
      
      return {
        meta: {
          source: 'error-fallback',
          fetched_at: new Date().toISOString(),
          count: 0
        },
        data: []
      };
    }
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    
    const cached = getCachedData();
    if (cached) {
      console.log('Returning stale cached data');
      return cached.data;
    }
    
    return {
      meta: {
        source: 'error-fallback',
        fetched_at: new Date().toISOString(),
        count: 0
      },
      data: []
    };
  }
}

export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
