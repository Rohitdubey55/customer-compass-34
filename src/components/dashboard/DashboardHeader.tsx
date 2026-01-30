import { RefreshCw, Download, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadSearch } from './CustomerSearch';
import { Lead } from '@/types/customer';
import { exportToCSV } from '@/lib/export';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DashboardHeaderProps {
  leads: Lead[];
  allLeads: Lead[];
  onSelectLead: (id: string) => void;
  selectedId: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export function DashboardHeader({
  leads,
  allLeads,
  onSelectLead,
  selectedId,
  lastUpdated,
  onRefresh,
  isLoading,
}: DashboardHeaderProps) {
  const handleBulkExport = () => {
    if (leads.length === 0) {
      toast({ 
        title: 'No leads to export', 
        description: 'Adjust your filters to include leads',
        variant: 'destructive' 
      });
      return;
    }
    exportToCSV(leads, `leads-export-${format(new Date(), 'yyyy-MM-dd')}`);
    toast({ 
      title: 'Export complete', 
      description: `Exported ${leads.length} lead(s)` 
    });
  };

  return (
    <header className="border-b bg-card">
      <div className="px-4 lg:px-6 py-4">
        {/* Top row: Logo and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">L</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">Leads Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Sales pipeline from Google Sheet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Last updated */}
            {lastUpdated && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                <Clock className="h-3.5 w-3.5" />
                <span>Updated {format(lastUpdated, 'MMM d, h:mm a')}</span>
              </div>
            )}

            {/* Refresh */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Bulk export */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBulkExport}
              disabled={leads.length === 0}
            >
              <Download className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Export</span>
              {leads.length > 0 && (
                <span className="ml-1 text-xs">({leads.length})</span>
              )}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <LeadSearch
          leads={allLeads}
          onSelect={onSelectLead}
          selectedId={selectedId}
        />
      </div>
    </header>
  );
}
