import { Plus } from 'lucide-react';

interface FamilyOfficeHeaderProps {
  currentDateText: string;
  onCreateObligation: () => void;
}

export default function FamilyOfficeHeader({
  currentDateText,
  onCreateObligation,
}: FamilyOfficeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-primary font-hubot tracking-tight">
          Dashboard Family Office
        </h1>
        <p className="text-sm text-neutral-muted mt-0.5">
          Vista global de obligaciones · {currentDateText}
        </p>
      </div>
      <button
        onClick={onCreateObligation}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors duration-200 shadow-sm self-start"
      >
        <Plus size={15} />
        Crear obligación
      </button>
    </div>
  );
}
