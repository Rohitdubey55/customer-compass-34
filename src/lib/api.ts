import { Lead, LeadApiResponse } from '@/types/customer';

const API_URL = 'https://script.google.com/macros/s/AKfycbwsIP0OipyJRA6uG6dmvMO4RdiOSegyVOaIfXovR0HJpyRnlq0DmzLG1Bh0GtEishLvtA/exec';
const CACHE_KEY = 'leads_v2';
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
  '': string;  // Column 1 - company name
  'Phase 0': string;  // Lead Origin
  'Basic Information (Sales Team)': string;  // PIM or CM
  'Phase 1': string;  // Management Lead
  'Push for Pilot + LOI (Management Team)': boolean | string;  // Intro Meeting
  'Phase 2': string;  // Delivery Lead
  'Pilot + Spend Rampup (Delivery Team)': string | boolean;  // Weekly calls
  'Next Steps': string;  // Current Progress
  '*Info': string;  // Additional info
  'Additional Info': string;  // Commodities
}

function transformSheetData(rawData: RawSheetRow[]): Lead[] {
  // Skip the header row (first row contains column descriptions)
  const dataRows = rawData.slice(1);
  
  return dataRows
    .map((row, index) => ({
      id: `lead_${index + 1}`,
      company: row[''] || '',
      leadOrigin: row['Phase 0'] || '',
      teamType: row['Basic Information (Sales Team)'] || '',
      managementLead: row['Phase 1'] || '',
      hasIntroMeeting: row['Push for Pilot + LOI (Management Team)'] === true || 
                       row['Push for Pilot + LOI (Management Team)'] === 'true',
      deliveryLead: row['Phase 2'] || '',
      hasWeeklyCalls: String(row['Pilot + Spend Rampup (Delivery Team)']).toLowerCase() === 'yes' || 
                      row['Pilot + Spend Rampup (Delivery Team)'] === true,
      nextSteps: row['Next Steps'] || '',
      info: row['*Info'] || '',
      commodities: row['Additional Info'] || '',
    }))
    // Filter out completely empty rows
    .filter(lead => lead.company || lead.leadOrigin || lead.managementLead || lead.nextSteps);
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
