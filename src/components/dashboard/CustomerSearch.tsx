import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, X, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Lead } from '@/types/customer';
import { cn } from '@/lib/utils';
import { LeadOriginBadge } from './StatusBadge';

interface LeadSearchProps {
  leads: Lead[];
  onSelect: (leadId: string) => void;
  selectedId: string | null;
}

export function LeadSearch({ leads, onSelect, selectedId }: LeadSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const searchLower = query.toLowerCase();
    return leads
      .filter(l => 
        l.customer.toLowerCase().includes(searchLower) ||
        l.managementLead.toLowerCase().includes(searchLower) ||
        l.deliveryLead.toLowerCase().includes(searchLower) ||
        l.customerContact.toLowerCase().includes(searchLower) ||
        l.currentProgress.toLowerCase().includes(searchLower)
      )
      .slice(0, 8);
  }, [query, leads]);

  const handleSelect = useCallback((leadId: string) => {
    onSelect(leadId);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && query.length >= 2 && suggestions.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [isOpen, suggestions, highlightedIndex, query, handleSelect]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    if (query.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
      setHighlightedIndex(0);
    } else {
      setIsOpen(false);
    }
  }, [query, suggestions.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.parentElement?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="typeahead-container w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search leads, customers, contacts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-9 pr-9"
          aria-label="Search leads"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="lead-suggestions"
          role="combobox"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div 
          ref={listRef}
          id="lead-suggestions"
          className="typeahead-dropdown custom-scrollbar"
          role="listbox"
        >
          {suggestions.map((lead, index) => (
            <button
              key={lead.id}
              onClick={() => handleSelect(lead.id)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'typeahead-item w-full text-left flex items-center gap-3',
                index === highlightedIndex && 'typeahead-item-active',
                lead.id === selectedId && 'bg-accent'
              )}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {lead.customer || lead.managementLead || 'Unnamed Lead'}
                  </span>
                  <LeadOriginBadge origin={lead.leadOrigin} />
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {lead.customerContact && `${lead.customerContact}`}
                  {lead.managementLead && ` • ${lead.managementLead}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && suggestions.length === 0 && (
        <div className="typeahead-dropdown py-4 text-center text-muted-foreground">
          No leads match "{query}"
        </div>
      )}
    </div>
  );
}
