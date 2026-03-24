import type { DateRangeOption } from '../types';
import { DATE_RANGE_OPTIONS } from '../types';

interface DateRangeSelectorProps {
  dateRange: DateRangeOption;
  onChange: (days: DateRangeOption) => void;
}

export default function DateRangeSelector({
  dateRange,
  onChange,
}: DateRangeSelectorProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-neutral-muted uppercase tracking-widest mr-1">
        Ventana de vencimientos
      </span>
      <div className="inline-flex items-center gap-1 p-1 bg-neutral-surface border border-neutral-border rounded-xl">
        {DATE_RANGE_OPTIONS.map((days) => (
          <button
            key={days}
            onClick={() => onChange(days)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              dateRange === days
                ? 'bg-primary text-white shadow-sm'
                : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            {days}d
          </button>
        ))}
      </div>
    </div>
  );
}
