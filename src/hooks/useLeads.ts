import { useState, useEffect, useMemo, useCallback } from 'react';
import { Lead, LeadFilters, SortConfig, LeadApiResponse } from '@/types/customer';
import { fetchLeads, getLastUpdatedTime, clearCache } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const initialFilters: LeadFilters = {
  search: '',
  leadOrigins: [],
  teamTypes: [],
  managementLeads: [],
  deliveryLeads: [],
  hasIntroMeeting: null,
};

const initialSort: SortConfig = {
  field: 'company',
  direction: 'asc'
};

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState<LeadFilters>(initialFilters);
  const [sort, setSort] = useState<SortConfig>(initialSort);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});

  // Load local notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lead_local_notes');
      if (saved) {
        setLocalNotes(JSON.parse(saved));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save local notes to localStorage
  const updateLocalNotes = useCallback((leadId: string, notes: string) => {
    setLocalNotes(prev => {
      const updated = { ...prev, [leadId]: notes };
      localStorage.setItem('lead_local_notes', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadLeads = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: LeadApiResponse = await fetchLeads(forceRefresh);
      const data = Array.isArray(response?.data) ? response.data : [];
      setLeads(data);
      setLastUpdated(getLastUpdatedTime());
      
      if (forceRefresh) {
        toast({
          title: 'Data refreshed',
          description: `Loaded ${data.length} leads from Google Sheet`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load leads';
      setError(message);
      toast({
        title: 'Error loading data',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const refresh = useCallback(() => {
    clearCache();
    loadLeads(true);
  }, [loadLeads]);

  // Extract unique filter options from data
  const filterOptions = useMemo(() => {
    const safeLeads = leads || [];
    return {
      leadOrigins: [...new Set(safeLeads.map(l => l.leadOrigin))].filter(Boolean).sort(),
      teamTypes: [...new Set(safeLeads.map(l => l.teamType))].filter(Boolean).sort(),
      managementLeads: [...new Set(safeLeads.map(l => l.managementLead))].filter(Boolean).sort(),
      deliveryLeads: [...new Set(safeLeads.map(l => l.deliveryLead))].filter(Boolean).sort(),
    };
  }, [leads]);

  // Apply filters and sorting
  const filteredLeads = useMemo(() => {
    const safeLeads = leads || [];
    let result = [...safeLeads];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(l => 
        l.company.toLowerCase().includes(searchLower) ||
        l.managementLead.toLowerCase().includes(searchLower) ||
        l.deliveryLead.toLowerCase().includes(searchLower) ||
        l.nextSteps.toLowerCase().includes(searchLower) ||
        l.commodities.toLowerCase().includes(searchLower)
      );
    }

    // Lead Origin filter
    if (filters.leadOrigins.length > 0) {
      result = result.filter(l => filters.leadOrigins.includes(l.leadOrigin));
    }

    // Team Type filter
    if (filters.teamTypes.length > 0) {
      result = result.filter(l => filters.teamTypes.includes(l.teamType));
    }

    // Management Lead filter
    if (filters.managementLeads.length > 0) {
      result = result.filter(l => filters.managementLeads.includes(l.managementLead));
    }

    // Delivery Lead filter
    if (filters.deliveryLeads.length > 0) {
      result = result.filter(l => filters.deliveryLeads.includes(l.deliveryLead));
    }

    // Intro Meeting filter
    if (filters.hasIntroMeeting !== null) {
      result = result.filter(l => l.hasIntroMeeting === filters.hasIntroMeeting);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = '';
      let bVal = '';

      switch (sort.field) {
        case 'company':
          aVal = a.company.toLowerCase();
          bVal = b.company.toLowerCase();
          break;
        case 'leadOrigin':
          aVal = a.leadOrigin.toLowerCase();
          bVal = b.leadOrigin.toLowerCase();
          break;
        case 'managementLead':
          aVal = a.managementLead.toLowerCase();
          bVal = b.managementLead.toLowerCase();
          break;
        case 'deliveryLead':
          aVal = a.deliveryLead.toLowerCase();
          bVal = b.deliveryLead.toLowerCase();
          break;
      }

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, filters, sort]);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    const safeLeads = leads || [];
    return safeLeads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  const toggleSort = useCallback((field: SortConfig['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const updateFilter = useCallback(<K extends keyof LeadFilters>(
    key: K,
    value: LeadFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters = useMemo(() => 
    filters.search !== '' ||
    filters.leadOrigins.length > 0 ||
    filters.teamTypes.length > 0 ||
    filters.managementLeads.length > 0 ||
    filters.deliveryLeads.length > 0 ||
    filters.hasIntroMeeting !== null
  , [filters]);

  return {
    leads: filteredLeads,
    allLeads: leads,
    isLoading,
    error,
    lastUpdated,
    refresh,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterOptions,
    sort,
    toggleSort,
    selectedLead,
    selectedLeadId,
    setSelectedLeadId,
    localNotes,
    updateLocalNotes,
  };
}
