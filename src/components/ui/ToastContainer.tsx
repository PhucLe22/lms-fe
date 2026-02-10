import { useToast } from "../../hooks/useToast";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const variants = {
    success: "bg-gray-900 text-white",
    error: "bg-red-600 text-white",
    info: "bg-white text-gray-900 border border-gray-200 shadow-lg",
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg text-sm shadow-md flex items-center justify-between gap-3 animate-[slideIn_0.2s_ease-out] ${variants[t.variant]}`}
          role="alert"
        >
          <span>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
