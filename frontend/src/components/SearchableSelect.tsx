'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export interface SearchableOption {
  id: number;
  label: string;
  sublabel?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
}: {
  options: SearchableOption[];
  value: number | null;
  onChange: (id: number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value !== null ? options.find(o => o.id === value) : undefined;

  const filtered = options.filter(o => {
    if (!query) return true;
    const q = query.toLowerCase();
    return o.label.toLowerCase().includes(q) ||
      (o.sublabel?.toLowerCase().includes(q) ?? false);
  });

  const handleSelect = (id: number) => {
    onChange(id);
    setQuery('');
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative mt-1">
      <div
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 0); }}
        className="input-field flex items-center justify-between cursor-pointer"
      >
        <span className={selected ? 'text-gray-900 truncate' : 'text-gray-400'}>
          {selected ? `${selected.label}${selected.sublabel ? ` ${selected.sublabel}` : ''}` : placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-500 text-center">No se encontraron resultados</p>
            ) : (
              filtered.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => handleSelect(o.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors flex items-center justify-between ${
                    o.id === value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium truncate">{o.label}</span>
                  {o.sublabel && <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{o.sublabel}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
