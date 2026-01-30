import { useState, useEffect, useMemo, useCallback } from 'react';
import { Customer, CustomerFilters, SortConfig, CustomerApiResponse } from '@/types/customer';
import { fetchCustomers, getLastUpdatedTime, clearCache } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const initialFilters: CustomerFilters = {
  search: '',
  regions: [],
  statuses: [],
  tiers: [],
  dateRange: { from: null, to: null }
};

const initialSort: SortConfig = {
  field: 'name',
  direction: 'asc'
};

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters);
  const [sort, setSort] = useState<SortConfig>(initialSort);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});

  // Load local notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('customer_local_notes');
      if (saved) {
        setLocalNotes(JSON.parse(saved));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save local notes to localStorage
  const updateLocalNotes = useCallback((customerId: string, notes: string) => {
    setLocalNotes(prev => {
      const updated = { ...prev, [customerId]: notes };
      localStorage.setItem('customer_local_notes', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadCustomers = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: CustomerApiResponse = await fetchCustomers(forceRefresh);
      const data = Array.isArray(response?.data) ? response.data : [];
      setCustomers(data);
      setLastUpdated(getLastUpdatedTime());
      
      if (forceRefresh) {
        toast({
          title: 'Data refreshed',
          description: `Loaded ${data.length} customers`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load customers';
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
    loadCustomers();
  }, [loadCustomers]);

  const refresh = useCallback(() => {
    clearCache();
    loadCustomers(true);
  }, [loadCustomers]);

  // Extract unique filter options from data
  const filterOptions = useMemo(() => {
    const safeCustomers = customers || [];
    return {
      regions: [...new Set(safeCustomers.map(c => c.region))].filter(Boolean).sort(),
      statuses: [...new Set(safeCustomers.map(c => c.status))].filter(Boolean).sort(),
      tiers: [...new Set(safeCustomers.map(c => c.tier))].filter(Boolean).sort(),
    };
  }, [customers]);

  // Apply filters and sorting
  const filteredCustomers = useMemo(() => {
    const safeCustomers = customers || [];
    let result = [...safeCustomers];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.company.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.notes.toLowerCase().includes(searchLower)
      );
    }

    // Region filter
    if (filters.regions.length > 0) {
      result = result.filter(c => filters.regions.includes(c.region));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter(c => filters.statuses.includes(c.status));
    }

    // Tier filter
    if (filters.tiers.length > 0) {
      result = result.filter(c => filters.tiers.includes(c.tier));
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      result = result.filter(c => {
        const contactDate = new Date(c.last_contacted);
        if (filters.dateRange.from && contactDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && contactDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: string | Date = '';
      let bVal: string | Date = '';

      switch (sort.field) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'company':
          aVal = a.company.toLowerCase();
          bVal = b.company.toLowerCase();
          break;
        case 'status':
          aVal = a.status.toLowerCase();
          bVal = b.status.toLowerCase();
          break;
        case 'last_contacted':
          aVal = new Date(a.last_contacted);
          bVal = new Date(b.last_contacted);
          break;
      }

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, filters, sort]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    const safeCustomers = customers || [];
    return safeCustomers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const toggleSort = useCallback((field: SortConfig['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const updateFilter = useCallback(<K extends keyof CustomerFilters>(
    key: K,
    value: CustomerFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters = useMemo(() => 
    filters.search !== '' ||
    filters.regions.length > 0 ||
    filters.statuses.length > 0 ||
    filters.tiers.length > 0 ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null
  , [filters]);

  return {
    customers: filteredCustomers,
    allCustomers: customers,
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
    selectedCustomer,
    selectedCustomerId,
    setSelectedCustomerId,
    localNotes,
    updateLocalNotes,
  };
}
