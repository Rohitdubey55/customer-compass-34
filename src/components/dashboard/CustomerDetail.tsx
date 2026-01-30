import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Copy, 
  Download, 
  FileJson, 
  FileText,
  Check,
  Paperclip,
  X,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types/customer';
import { StatusBadge, TierBadge } from './StatusBadge';
import { exportToJSON, exportToCSV, copyToClipboard } from '@/lib/export';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CustomerDetailProps {
  customer: Customer | null;
  localNotes: Record<string, string>;
  onUpdateNotes: (customerId: string, notes: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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

export function CustomerDetail({ 
  customer, 
  localNotes, 
  onUpdateNotes,
  onClose,
  isMobile 
}: CustomerDetailProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!customer) {
    return (
      <div className="dashboard-panel h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
        <User className="h-16 w-16 mb-4 opacity-20" />
        <p className="font-medium text-lg">No customer selected</p>
        <p className="text-sm mt-1">
          Select a customer from the list or use the search to view details
        </p>
      </div>
    );
  }

  const handleCopyEmail = async () => {
    try {
      await copyToClipboard(customer.email);
      setCopiedEmail(true);
      toast({ title: 'Email copied to clipboard' });
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast({ title: 'Failed to copy email', variant: 'destructive' });
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      ...customer,
      localNotes: localNotes[customer.id] || ''
    };
    exportToJSON(exportData, `customer-${customer.id}`);
    toast({ title: 'Exported as JSON' });
  };

  const handleExportCSV = () => {
    exportToCSV([customer], `customer-${customer.id}`);
    toast({ title: 'Exported as CSV' });
  };

  const currentNotes = localNotes[customer.id] ?? '';

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
            <span className="text-lg font-semibold text-primary">
              {getInitials(customer.name)}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-lg truncate">{customer.name}</h2>
            <p className="text-sm text-muted-foreground truncate">{customer.company}</p>
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
        {/* Status & Tier */}
        <div className="flex items-center gap-2">
          <StatusBadge status={customer.status} />
          <span className="text-muted-foreground">•</span>
          <TierBadge tier={customer.tier} />
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Contact Information
          </h3>
          
          <DetailRow icon={Mail} label="Email">
            <div className="flex items-center gap-2">
              <a 
                href={`mailto:${customer.email}`} 
                className="text-primary hover:underline truncate"
              >
                {customer.email}
              </a>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 flex-shrink-0"
                onClick={handleCopyEmail}
                aria-label="Copy email"
              >
                {copiedEmail ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </DetailRow>

          <DetailRow icon={Phone} label="Phone">
            <a 
              href={`tel:${customer.phone}`} 
              className="text-primary hover:underline"
            >
              {customer.phone}
            </a>
          </DetailRow>

          <DetailRow icon={MapPin} label="Region">
            {customer.region}
          </DetailRow>

          <DetailRow icon={Calendar} label="Last Contacted">
            {format(new Date(customer.last_contacted), 'MMMM d, yyyy')}
          </DetailRow>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Notes
          </h3>
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            {customer.notes || <span className="text-muted-foreground italic">No notes</span>}
          </div>
        </div>

        {/* Local Notes (editable) */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Notes (Local)
          </h3>
          <Textarea
            value={currentNotes}
            onChange={(e) => onUpdateNotes(customer.id, e.target.value)}
            placeholder="Add your private notes here... (saved locally)"
            className="min-h-[80px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            These notes are saved in your browser and included in exports.
          </p>
        </div>

        {/* Attachments */}
        {customer.attachments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Attachments
            </h3>
            <div className="space-y-2">
              {customer.attachments.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate flex-1">Attachment {i + 1}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {customer.custom_fields && Object.keys(customer.custom_fields).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Custom Fields
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(customer.custom_fields).map(([key, value]) => (
                <div key={key} className="p-2 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm font-medium mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
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
