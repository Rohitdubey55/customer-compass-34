import { X, Filter, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CustomerFilters as FilterType } from '@/types/customer';
import { format } from 'date-fns';

interface CustomerFiltersProps {
  filters: FilterType;
  filterOptions: {
    regions: string[];
    statuses: string[];
    tiers: string[];
  };
  onUpdateFilter: <K extends keyof FilterType>(key: K, value: FilterType[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function CustomerFilters({
  filters,
  filterOptions,
  onUpdateFilter,
  onClearFilters,
  hasActiveFilters,
}: CustomerFiltersProps) {
  const toggleArrayFilter = (
    key: 'regions' | 'statuses' | 'tiers',
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onUpdateFilter(key, updated);
  };

  const activeFilterCount = 
    filters.regions.length + 
    filters.statuses.length + 
    filters.tiers.length +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Region Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={filters.regions.length > 0 ? "default" : "outline"} 
            size="sm"
            className="h-8"
          >
            Region
            {filters.regions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-primary-foreground/20">
                {filters.regions.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1">
            {filterOptions.regions.map(region => (
              <div key={region} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-accent">
                <Checkbox
                  id={`region-${region}`}
                  checked={filters.regions.includes(region)}
                  onCheckedChange={() => toggleArrayFilter('regions', region)}
                />
                <Label 
                  htmlFor={`region-${region}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {region}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Status Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={filters.statuses.length > 0 ? "default" : "outline"} 
            size="sm"
            className="h-8"
          >
            Status
            {filters.statuses.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-primary-foreground/20">
                {filters.statuses.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2" align="start">
          <div className="space-y-1">
            {filterOptions.statuses.map(status => (
              <div key={status} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-accent">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.statuses.includes(status)}
                  onCheckedChange={() => toggleArrayFilter('statuses', status)}
                />
                <Label 
                  htmlFor={`status-${status}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Tier Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={filters.tiers.length > 0 ? "default" : "outline"} 
            size="sm"
            className="h-8"
          >
            Tier
            {filters.tiers.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-primary-foreground/20">
                {filters.tiers.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-2" align="start">
          <div className="space-y-1">
            {filterOptions.tiers.map(tier => (
              <div key={tier} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-accent">
                <Checkbox
                  id={`tier-${tier}`}
                  checked={filters.tiers.includes(tier)}
                  onCheckedChange={() => toggleArrayFilter('tiers', tier)}
                />
                <Label 
                  htmlFor={`tier-${tier}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {tier}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={(filters.dateRange.from || filters.dateRange.to) ? "default" : "outline"} 
            size="sm"
            className="h-8"
          >
            <CalendarDays className="h-3.5 w-3.5 mr-1" />
            {filters.dateRange.from && filters.dateRange.to ? (
              <span className="text-xs">
                {format(filters.dateRange.from, 'MMM d')} - {format(filters.dateRange.to, 'MMM d')}
              </span>
            ) : filters.dateRange.from ? (
              <span className="text-xs">From {format(filters.dateRange.from, 'MMM d')}</span>
            ) : filters.dateRange.to ? (
              <span className="text-xs">Until {format(filters.dateRange.to, 'MMM d')}</span>
            ) : (
              'Date Range'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: filters.dateRange.from || undefined,
              to: filters.dateRange.to || undefined,
            }}
            onSelect={(range) => {
              onUpdateFilter('dateRange', {
                from: range?.from || null,
                to: range?.to || null,
              });
            }}
            numberOfMonths={1}
          />
          {(filters.dateRange.from || filters.dateRange.to) && (
            <div className="p-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => onUpdateFilter('dateRange', { from: null, to: null })}
              >
                Clear dates
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Clear All */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Clear all ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
