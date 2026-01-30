import { cn } from '@/lib/utils';

interface LeadOriginBadgeProps {
  origin: string;
  className?: string;
}

export function LeadOriginBadge({ origin, className }: LeadOriginBadgeProps) {
  const getBadgeClass = () => {
    const originLower = origin.toLowerCase();
    if (originLower.includes('mark') || originLower.includes('l-mark')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (originLower.includes('doug') || originLower.includes('e-doug')) {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (originLower.includes('chaise') || originLower.includes('l-chaise')) {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (originLower.includes('rohit') || originLower.includes('l-rohit')) {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    if (originLower.includes('alam') || originLower.includes('l-alam')) {
      return 'bg-teal-100 text-teal-700 border-teal-200';
    }
    if (originLower.includes('edward')) {
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
    if (originLower.includes('past')) {
      return 'bg-gray-100 text-gray-600 border-gray-200';
    }
    if (originLower.includes('harsh')) {
      return 'bg-pink-100 text-pink-700 border-pink-200';
    }
    if (originLower.includes('jody')) {
      return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    }
    return 'bg-muted text-muted-foreground border-border';
  };

  if (!origin) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        getBadgeClass(),
        className
      )}
    >
      {origin}
    </span>
  );
}

interface PimCmBadgeProps {
  type: string;
  className?: string;
}

export function PimCmBadge({ type, className }: PimCmBadgeProps) {
  const getBadgeClass = () => {
    switch (type.toUpperCase()) {
      case 'PIM':
        return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'CM':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'BOTH':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (!type) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase border',
        getBadgeClass(),
        className
      )}
    >
      {type}
    </span>
  );
}

interface StatusIndicatorProps {
  active: boolean;
  label?: string;
  className?: string;
}

export function StatusIndicator({ active, label, className }: StatusIndicatorProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs',
        className
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          active ? 'bg-green-500' : 'bg-gray-300'
        )}
      />
      {label && <span className="text-muted-foreground">{label}</span>}
    </span>
  );
}

interface LoiBadgeProps {
  issued: boolean;
  signed: boolean;
  className?: string;
}

export function LoiBadge({ issued, signed, className }: LoiBadgeProps) {
  if (!issued && !signed) return null;
  
  const status = signed ? 'Signed' : 'Issued';
  const badgeClass = signed 
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-yellow-100 text-yellow-700 border-yellow-200';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        badgeClass,
        className
      )}
    >
      LOI {status}
    </span>
  );
}
