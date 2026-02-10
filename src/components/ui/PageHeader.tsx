import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  backTo,
  backLabel = "Back",
  actions,
}: PageHeaderProps) {
  return (
    <div className="space-y-3">
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {backLabel}
        </Link>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
