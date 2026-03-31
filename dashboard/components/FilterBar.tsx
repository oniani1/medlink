import React from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
}

interface FilterBarProps {
  filters: FilterDef[];
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
}

export function FilterBar({ filters, searchValue, onSearchChange, searchPlaceholder = 'Search...' }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      {onSearchChange && (
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchValue ?? ''}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors w-full sm:w-56"
          />
        </div>
      )}

      {/* Filter dropdowns */}
      {filters.map(filter => (
        <div key={filter.key} className="relative">
          <select
            value={filter.value}
            onChange={e => filter.onChange(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors cursor-pointer"
          >
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
