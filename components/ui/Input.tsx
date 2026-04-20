import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--foreground-2)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl
            px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50
            transition-all duration-200
            ${icon ? "pl-10" : ""}
            ${error ? "border-red-500/50 focus:ring-red-500/20" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground-2)]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl
          px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]
          focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50
          transition-all duration-200 resize-none
          ${error ? "border-red-500/50 focus:ring-red-500/20" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
