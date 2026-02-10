import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400",
  secondary:
    "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  ghost:
    "text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:text-gray-300",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      children,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed ${variants[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
