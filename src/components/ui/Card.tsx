import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddings = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  hover = false,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg ${paddings[padding]} ${hover ? "transition-shadow duration-150 hover:shadow-md" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
