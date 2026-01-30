import { ArrowUpDown, ArrowUp, ArrowDown, User } from 'lucide-react';
import { Customer, SortConfig, SortField } from '@/types/customer';
import { StatusBadge, TierBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CustomerListProps {
  customers: Customer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  sort: SortConfig;
  onSort: (field: SortField) => void;
  isLoading: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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

function CustomerRowSkeleton() {
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

export function CustomerList({ 
  customers, 
  selectedId, 
  onSelect, 
  sort, 
  onSort,
  isLoading 
}: CustomerListProps) {
  if (isLoading) {
    return (
      <div className="dashboard-panel flex-1 flex flex-col overflow-hidden">
        <div className="dashboard-header">
          <span className="text-sm font-medium">Customers</span>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          {Array.from({ length: 6 }).map((_, i) => (
            <CustomerRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="dashboard-panel flex-1 flex flex-col overflow-hidden">
        <div className="dashboard-header">
          <span className="text-sm font-medium">Customers</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
          <div>
            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No customers match your filters</p>
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
          {customers.length} Customer{customers.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-4">
          <SortButton field="name" label="Name" sort={sort} onSort={onSort} />
          <SortButton field="company" label="Company" sort={sort} onSort={onSort} />
          <SortButton field="status" label="Status" sort={sort} onSort={onSort} />
          <SortButton field="last_contacted" label="Last Contact" sort={sort} onSort={onSort} />
        </div>
      </div>

      {/* Customer rows */}
      <div className="flex-1 overflow-auto custom-scrollbar" role="listbox">
        {customers.map((customer) => (
          <button
            key={customer.id}
            onClick={() => onSelect(customer.id)}
            className={cn(
              'customer-row w-full text-left',
              selectedId === customer.id && 'customer-row-selected'
            )}
            role="option"
            aria-selected={selectedId === customer.id}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {getInitials(customer.name)}
                </span>
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium truncate">{customer.name}</span>
                  <StatusBadge status={customer.status} />
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {customer.company}
                </div>
              </div>

              {/* Right side info */}
              <div className="flex-shrink-0 text-right hidden sm:block">
                <TierBadge tier={customer.tier} className="mb-0.5" />
                <div className="text-xs text-muted-foreground">
                  {format(new Date(customer.last_contacted), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
