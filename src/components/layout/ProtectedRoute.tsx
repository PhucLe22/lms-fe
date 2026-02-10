import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../ui/Spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "Admin" | "Student";
}

export default function ProtectedRoute({
  children,
  role,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
