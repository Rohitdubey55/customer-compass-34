import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LeadFilters as FilterType } from '@/types/customer';

interface LeadFiltersProps {
  filters: FilterType;
  filterOptions: {
    leadOrigins: string[];
    teamTypes: string[];
    managementLeads: string[];
    deliveryLeads: string[];
  };
  onUpdateFilter: <K extends keyof FilterType>(key: K, value: FilterType[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function LeadFilters({
  filters,
  filterOptions,
  onUpdateFilter,
  onClearFilters,
  hasActiveFilters,
}: LeadFiltersProps) {
  const toggleArrayFilter = (
    key: 'leadOrigins' | 'teamTypes' | 'managementLeads' | 'deliveryLeads',
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onUpdateFilter(key, updated);
  };

  const activeFilterCount = 
    filters.leadOrigins.length + 
    filters.teamTypes.length + 
    filters.managementLeads.length +
    filters.deliveryLeads.length +
    (filters.hasIntroMeeting !== null ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Lead Origin Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={filters.leadOrigins.length > 0 ? "default" : "outline"} 
            size="sm"
            className="h-8"
          >
            Lead Origin
            {filters.leadOrigins.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-primary-foreground/20">
                {filters.leadOrigins.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 max-h-60 overflow-auto" align="start">
          <div className="space-y-1">
            {filterOptions.leadOrigins.map(origin => (
              <div key={origin} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-accent">
                <Checkbox
                  id={`origin-${origin}`}
                  checked={filters.leadOrigins.includes(origin)}
                  onCheckedChange={() => toggleArrayFilter('leadOrigins', origin)}
                />
                <Label 
                  htmlFor={`origin-${origin}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {origin}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Team Type Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={filters.teamTypes.length > 0 ? "default" : "outline"} 
            size="sm"
            className="h-8"
          >
            Team
            {filters.teamTypes.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-primary-foreground/20">
                {filters.teamTypes.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-2" align="start">
          <div className="space-y-1">
            {filterOptions.teamTypes.map(type => (
              <div key={type} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-accent">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.teamTypes.includes(type)}
                  onCheckedChange={() => toggleArrayFilter('teamTypes', type)}
                />
                <Label 
                  htmlFor={`type-${type}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Management Lead Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={filters.managementLeads.length > 0 ? "default" : "outline"} 
            size="sm"
            className="h-8"
          >
            Manager
            {filters.managementLeads.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-primary-foreground/20">
                {filters.managementLeads.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 max-h-60 overflow-auto" align="start">
          <div className="space-y-1">
            {filterOptions.managementLeads.map(lead => (
              <div key={lead} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-accent">
                <Checkbox
                  id={`mgmt-${lead}`}
                  checked={filters.managementLeads.includes(lead)}
                  onCheckedChange={() => toggleArrayFilter('managementLeads', lead)}
                />
                <Label 
                  htmlFor={`mgmt-${lead}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {lead}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Intro Meeting Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={filters.hasIntroMeeting !== null ? "default" : "outline"} 
            size="sm"
            className="h-8"
          >
            Intro Meeting
            {filters.hasIntroMeeting !== null && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-primary-foreground/20">
                {filters.hasIntroMeeting ? '✓' : '✗'}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2" align="start">
          <div className="space-y-1">
            <button
              onClick={() => onUpdateFilter('hasIntroMeeting', true)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                filters.hasIntroMeeting === true ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
            >
              ✓ Has meeting
            </button>
            <button
              onClick={() => onUpdateFilter('hasIntroMeeting', false)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                filters.hasIntroMeeting === false ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
            >
              ✗ No meeting
            </button>
            <button
              onClick={() => onUpdateFilter('hasIntroMeeting', null)}
              className="w-full text-left px-2 py-1.5 rounded text-sm text-muted-foreground hover:bg-accent/50"
            >
              All
            </button>
          </div>
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
          Clear ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
