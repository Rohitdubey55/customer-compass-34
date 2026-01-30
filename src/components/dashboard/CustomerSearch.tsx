import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, X, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Customer } from '@/types/customer';
import { cn } from '@/lib/utils';

interface CustomerSearchProps {
  customers: Customer[];
  onSelect: (customerId: string) => void;
  selectedId: string | null;
}

export function CustomerSearch({ customers, onSelect, selectedId }: CustomerSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const searchLower = query.toLowerCase();
    return customers
      .filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.company.toLowerCase().includes(searchLower) ||
        c.region.toLowerCase().includes(searchLower)
      )
      .slice(0, 8);
  }, [query, customers]);

  const handleSelect = useCallback((customerId: string) => {
    onSelect(customerId);
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

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Open dropdown when typing
  useEffect(() => {
    if (query.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
      setHighlightedIndex(0);
    } else {
      setIsOpen(false);
    }
  }, [query, suggestions.length]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.parentElement?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'prospect': return 'badge-prospect';
      case 'active': return 'badge-active';
      case 'churned': return 'badge-churned';
      case 'lead': return 'badge-lead';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="typeahead-container w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search customers, companies, regions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-9 pr-9"
          aria-label="Search customers"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="customer-suggestions"
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
          id="customer-suggestions"
          className="typeahead-dropdown custom-scrollbar"
          role="listbox"
        >
          {suggestions.map((customer, index) => (
            <button
              key={customer.id}
              onClick={() => handleSelect(customer.id)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'typeahead-item w-full text-left flex items-center gap-3',
                index === highlightedIndex && 'typeahead-item-active',
                customer.id === selectedId && 'bg-accent'
              )}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{customer.name}</span>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded border uppercase font-medium',
                    getStatusBadgeClass(customer.status)
                  )}>
                    {customer.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {customer.company} • {customer.region}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && suggestions.length === 0 && (
        <div className="typeahead-dropdown py-4 text-center text-muted-foreground">
          No customers match "{query}"
        </div>
      )}
    </div>
  );
}
