import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${error ? "border-red-400 focus:ring-red-500" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
