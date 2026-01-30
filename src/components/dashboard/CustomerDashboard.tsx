import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { DashboardHeader } from './DashboardHeader';
import { LeadFilters } from './CustomerFilters';
import { LeadList } from './CustomerList';
import { LeadDetail } from './CustomerDetail';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CustomerDashboard() {
  const {
    leads,
    allLeads,
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
  } = useLeads();

  const isMobile = useIsMobile();
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const handleSelectLead = (id: string) => {
    setSelectedLeadId(id);
    if (isMobile) {
      setShowMobileDetail(true);
    }
  };

  const handleCloseMobileDetail = () => {
    setShowMobileDetail(false);
  };

  // Error state
  if (error && allLeads.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Failed to load leads</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with search */}
      <DashboardHeader
        leads={leads}
        allLeads={allLeads}
        onSelectLead={handleSelectLead}
        selectedId={selectedLeadId}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        isLoading={isLoading}
      />

      {/* Filters bar */}
      <div className="border-b bg-card px-4 lg:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Global text search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by company, person, notes..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9 h-8"
            />
          </div>

          {/* Filter controls */}
          <LeadFilters
            filters={filters}
            filterOptions={filterOptions}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lead list - left panel */}
        <div className="flex-1 lg:max-w-[55%] xl:max-w-[60%] p-4 lg:p-6 overflow-hidden flex flex-col">
          <LeadList
            leads={leads}
            selectedId={selectedLeadId}
            onSelect={handleSelectLead}
            sort={sort}
            onSort={toggleSort}
            isLoading={isLoading}
          />
        </div>

        {/* Lead detail - right panel (desktop) */}
        {!isMobile && (
          <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] p-4 lg:p-6 pl-0">
            <LeadDetail
              lead={selectedLead}
              localNotes={localNotes}
              onUpdateNotes={updateLocalNotes}
            />
          </div>
        )}

        {/* Lead detail - mobile overlay */}
        {isMobile && showMobileDetail && selectedLead && (
          <LeadDetail
            lead={selectedLead}
            localNotes={localNotes}
            onUpdateNotes={updateLocalNotes}
            onClose={handleCloseMobileDetail}
            isMobile
          />
        )}
      </div>
    </div>
  );
}
