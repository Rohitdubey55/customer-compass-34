import { ArrowUpDown, ArrowUp, ArrowDown, Building2 } from 'lucide-react';
import { Lead, SortConfig, SortField } from '@/types/customer';
import { LeadOriginBadge, TeamTypeBadge, StatusIndicator } from './StatusBadge';
import { cn } from '@/lib/utils';

interface LeadListProps {
  leads: Lead[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  sort: SortConfig;
  onSort: (field: SortField) => void;
  isLoading: boolean;
}

function SortButton({ 
  field, 
  label, 
  sort, 
  onSort,
  className 
}: { 
  field: SortField; 
  label: string; 
  sort: SortConfig; 
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = sort.field === field;
  
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors',
        isActive && 'text-foreground',
        className
      )}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {isActive ? (
        sort.direction === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

function LeadRowSkeleton() {
  return (
    <div className="customer-row animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded" />
          </div>
          <div className="h-3 w-48 bg-muted rounded" />
        </div>
        <div className="text-right">
          <div className="h-3 w-12 bg-muted rounded mb-1" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function LeadList({ 
  leads, 
  selectedId, 
  onSelect, 
  sort, 
  onSort,
  isLoading 
}: LeadListProps) {
  if (isLoading) {
    return (
      <div className="dashboard-panel flex-1 flex flex-col overflow-hidden">
        <div className="dashboard-header">
          <span className="text-sm font-medium">Leads</span>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          {Array.from({ length: 6 }).map((_, i) => (
            <LeadRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="dashboard-panel flex-1 flex flex-col overflow-hidden">
        <div className="dashboard-header">
          <span className="text-sm font-medium">Leads</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
          <div>
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No leads match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel flex-1 flex flex-col overflow-hidden">
      {/* Header with sort controls */}
      <div className="dashboard-header flex-wrap gap-2">
        <span className="text-sm font-medium">
          {leads.length} Lead{leads.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-4">
          <SortButton field="company" label="Company" sort={sort} onSort={onSort} />
          <SortButton field="leadOrigin" label="Origin" sort={sort} onSort={onSort} />
          <SortButton field="managementLead" label="Manager" sort={sort} onSort={onSort} />
          <SortButton field="deliveryLead" label="Delivery" sort={sort} onSort={onSort} />
        </div>
      </div>

      {/* Lead rows */}
      <div className="flex-1 overflow-auto custom-scrollbar" role="listbox">
        {leads.map((lead) => (
          <button
            key={lead.id}
            onClick={() => onSelect(lead.id)}
            className={cn(
              'customer-row w-full text-left',
              selectedId === lead.id && 'customer-row-selected'
            )}
            role="option"
            aria-selected={selectedId === lead.id}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-medium truncate">
                    {lead.company || lead.managementLead || 'Unnamed Lead'}
                  </span>
                  <LeadOriginBadge origin={lead.leadOrigin} />
                  <TeamTypeBadge type={lead.teamType} />
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {lead.nextSteps || 'No next steps defined'}
                </div>
              </div>

              {/* Right side info */}
              <div className="flex-shrink-0 text-right hidden sm:flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <StatusIndicator active={lead.hasIntroMeeting} label="Intro" />
                  <StatusIndicator active={Boolean(lead.hasWeeklyCalls)} label="Weekly" />
                </div>
                {lead.managementLead && (
                  <div className="text-xs text-muted-foreground">
                    {lead.managementLead}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
