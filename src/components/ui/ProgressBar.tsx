interface ProgressBarProps {
  value: number;
  label?: string;
  detail?: string;
  size?: "sm" | "md";
}

const sizes = {
  sm: "h-1.5",
  md: "h-2.5",
};

export default function ProgressBar({
  value,
  label,
  detail,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div>
      {(label || detail) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {detail && (
            <span className="text-sm text-gray-500">{detail}</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${sizes[size]}`}>
        <div
          className={`bg-gray-900 ${sizes[size]} rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
