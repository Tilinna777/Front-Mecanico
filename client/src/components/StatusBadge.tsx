import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide bg-slate-100 text-slate-700 border-slate-200">
        Sin Estado
      </span>
    );
  }

  const getStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'completed':
      case 'finalizada':
      case 'excellent':
      case 'good':
        return "bg-green-100 text-green-700 border-green-200";
      case 'pending':
      case 'en_proceso':
      case 'regular':
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'working':
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 'cancelada':
      case 'bad':
        return "bg-red-100 text-red-700 border-red-200";
      case 'delivered':
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getLabel = (s: string) => {
    switch (s.toLowerCase()) {
      case 'completed':
      case 'finalizada':
        return 'Finalizada';
      case 'pending':
      case 'en_proceso':
        return 'En Proceso';
      case 'working':
        return 'En Trabajo';
      case 'cancelada':
        return 'Cancelada';
      default:
        return s;
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide",
      getStyles(status)
    )}>
      {getLabel(status)}
    </span>
  );
}
