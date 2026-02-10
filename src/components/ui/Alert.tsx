import type { ReactNode } from "react";

interface AlertProps {
  variant?: "error" | "info" | "warning" | "success";
  children: ReactNode;
  className?: string;
}

const variants = {
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function Alert({
  variant = "error",
  children,
  className = "",
}: AlertProps) {
  return (
    <div
      className={`border rounded-lg px-4 py-3 text-sm ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
