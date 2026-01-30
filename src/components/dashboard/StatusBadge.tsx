import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getBadgeClass = () => {
    switch (status.toLowerCase()) {
      case 'prospect':
        return 'badge-prospect';
      case 'active':
        return 'badge-active';
      case 'churned':
        return 'badge-churned';
      case 'lead':
        return 'badge-lead';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide border',
        getBadgeClass(),
        className
      )}
    >
      {status}
    </span>
  );
}

interface TierBadgeProps {
  tier: string;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const getTierClass = () => {
    switch (tier.toLowerCase()) {
      case 'tier 1':
        return 'tier-1';
      case 'tier 2':
        return 'tier-2';
      case 'tier 3':
        return 'tier-3';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium',
        getTierClass(),
        className
      )}
    >
      {tier}
    </span>
  );
}
