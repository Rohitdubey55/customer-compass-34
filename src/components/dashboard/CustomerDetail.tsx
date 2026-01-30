import { useState } from 'react';
import { 
  Building2,
  Users,
  Truck,
  ExternalLink, 
  Copy, 
  FileJson, 
  FileText,
  Check,
  X,
  Calendar,
  CheckCircle2,
  XCircle,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lead } from '@/types/customer';
import { LeadOriginBadge, PimCmBadge, LoiBadge } from './StatusBadge';
import { exportToJSON, exportToCSV, copyToClipboard } from '@/lib/export';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';

interface LeadDetailProps {
  lead: Lead | null;
  localNotes: Record<string, string>;
  onUpdateNotes: (leadId: string, notes: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

function DetailRow({ 
  icon: Icon, 
  label, 
  children,
  className 
}: { 
  icon: React.ElementType; 
  label: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: boolean | string }) {
  const isYes = value === true || value === 'Yes';
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn(
        'text-sm font-medium',
        isYes ? 'text-green-600' : 'text-muted-foreground'
      )}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'No')}
      </span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.toLowerCase().includes('hold')) return 'On Hold';
  
  try {
    const date = parseISO(dateStr);
    if (isValid(date)) {
      return format(date, 'MMM d, yyyy');
    }
  } catch {
    // Return as-is if parsing fails
  }
  return dateStr;
}

export function LeadDetail({ 
  lead, 
  localNotes, 
  onUpdateNotes,
  onClose,
  isMobile 
}: LeadDetailProps) {
  const [copiedProgress, setCopiedProgress] = useState(false);

  if (!lead) {
    return (
      <div className="dashboard-panel h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
        <Building2 className="h-16 w-16 mb-4 opacity-20" />
        <p className="font-medium text-lg">No lead selected</p>
        <p className="text-sm mt-1">
          Select a lead from the list or use the search to view details
        </p>
      </div>
    );
  }

  const handleCopyProgress = async () => {
    try {
      await copyToClipboard(lead.currentProgress);
      setCopiedProgress(true);
      toast({ title: 'Progress copied to clipboard' });
      setTimeout(() => setCopiedProgress(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      ...lead,
      localNotes: localNotes[lead.id] || ''
    };
    exportToJSON(exportData, `lead-${lead.customer.replace(/\s+/g, '-').toLowerCase()}`);
    toast({ title: 'Exported as JSON' });
  };

  const handleExportCSV = () => {
    exportToCSV([lead], `lead-${lead.customer.replace(/\s+/g, '-').toLowerCase()}`);
    toast({ title: 'Exported as CSV' });
  };

  const currentNotes = localNotes[lead.id] ?? '';

  const sheetUrl = `https://docs.google.com/spreadsheets/d/1MdTVpi6Iq3PGMznT0SMgGrPuxz3nZPTjYxCtecE6_OE/edit`;

  return (
    <div className={cn(
      'dashboard-panel h-full flex flex-col overflow-hidden',
      isMobile && 'fixed inset-0 z-50 rounded-none animate-slide-in-right'
    )}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-lg truncate">
              {lead.customer}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <LeadOriginBadge origin={lead.leadOrigin} />
              <PimCmBadge type={lead.pimOrCm} />
              <LoiBadge issued={lead.loiIssued} signed={lead.loiSigned} />
            </div>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-6">
        {/* Status Indicators */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            {lead.introductoryMeeting ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300" />
            )}
            <span className="text-sm">Intro Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            {lead.weeklyCalls === 'Yes' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300" />
            )}
            <span className="text-sm">Weekly Calls</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Contact Information
          </h3>
          
          <DetailRow icon={User} label="Customer Contact">
            {lead.customerContact || <span className="text-muted-foreground italic">Not provided</span>}
          </DetailRow>

          {lead.midLevelManager && (
            <DetailRow icon={User} label="Mid-Level Manager">
              {lead.midLevelManager}
            </DetailRow>
          )}

          <DetailRow icon={User} label="Strategic Owner">
            {lead.strategicOwner || <span className="text-muted-foreground italic">Not assigned</span>}
          </DetailRow>
        </div>

        {/* Team Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Team Assignment
          </h3>
          
          <DetailRow icon={Users} label="Management Lead">
            {lead.managementLead || <span className="text-muted-foreground italic">Not assigned</span>}
          </DetailRow>

          <DetailRow icon={Truck} label="Delivery Lead">
            {lead.deliveryLead || <span className="text-muted-foreground italic">Not assigned</span>}
          </DetailRow>
        </div>

        {/* Pipeline Status */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pipeline Status
          </h3>
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <StatusRow label="PPTs Shared" value={lead.pptsShared} />
            <StatusRow label="Verbal Agreement" value={lead.verbalAgreement} />
            <StatusRow label="NDA Signed" value={lead.ndaSigned} />
            <StatusRow label="LOI Issued" value={lead.loiIssued} />
            <StatusRow label="LOI Signed" value={lead.loiSigned} />
            <StatusRow label="Contract Signed" value={lead.contractSigned} />
            <StatusRow label="Parts & Spend Received" value={lead.partsSpendReceived} />
          </div>
        </div>

        {/* Dates */}
        {(lead.nextFollowup || lead.lastMeeting) && (
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dates
            </h3>
            
            {lead.nextFollowup && (
              <DetailRow icon={Calendar} label="Next Followup">
                {formatDate(lead.nextFollowup)}
              </DetailRow>
            )}

            {lead.lastMeeting && (
              <DetailRow icon={Calendar} label="Last Meeting">
                {formatDate(lead.lastMeeting)}
              </DetailRow>
            )}
          </div>
        )}

        {/* Current Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current Progress
            </h3>
            {lead.currentProgress && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2"
                onClick={handleCopyProgress}
              >
                {copiedProgress ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            {lead.currentProgress || <span className="text-muted-foreground italic">No progress notes</span>}
          </div>
        </div>

        {/* Additional Info */}
        {(lead.commodities || lead.spend) && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Additional Information
            </h3>
            
            {lead.commodities && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Commodities</div>
                {lead.commodities}
              </div>
            )}
            
            {lead.spend && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Spend</div>
                {lead.spend}
              </div>
            )}
          </div>
        )}

        {/* Local Notes (editable) */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Notes (Local)
          </h3>
          <Textarea
            value={currentNotes}
            onChange={(e) => onUpdateNotes(lead.id, e.target.value)}
            placeholder="Add your private notes here... (saved locally)"
            className="min-h-[80px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            These notes are saved in your browser and included in exports.
          </p>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="border-t p-4 space-y-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleExportJSON}
          >
            <FileJson className="h-4 w-4 mr-1.5" />
            Export JSON
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleExportCSV}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full"
          asChild
        >
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Open in Google Sheet
          </a>
        </Button>
      </div>
    </div>
  );
}
