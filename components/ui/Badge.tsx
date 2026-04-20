type BadgeVariant = "open" | "pending" | "resolved" | "low" | "medium" | "high" | "urgent" | "default";

const variants: Record<BadgeVariant, string> = {
  open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  resolved: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  urgent: "bg-red-500/15 text-red-400 border-red-500/25",
  default: "bg-[var(--surface-3)] text-[var(--muted)] border-[var(--border)]",
};

const dotColors: Record<BadgeVariant, string> = {
  open: "bg-emerald-400",
  pending: "bg-amber-400",
  resolved: "bg-slate-400",
  low: "bg-blue-400",
  medium: "bg-yellow-400",
  high: "bg-orange-400",
  urgent: "bg-red-400",
  default: "bg-slate-400",
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  showDot?: boolean;
  pulse?: boolean;
}

export function Badge({ label, variant = "default", showDot = false, pulse = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${variants[variant]}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${
            pulse ? "animate-pulse" : ""
          }`}
        />
      )}
      {label}
    </span>
  );
}
