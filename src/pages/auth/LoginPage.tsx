import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import type { LoginRequest } from "../../types";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";

export default function LoginPage() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginRequest>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await authApi.login(data);
      login(res.data);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card padding="lg" className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Log in to LMS
        </h1>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email",
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900 hover:underline">
              Forgot password?
            </Link>
          </div>
        </form>

        <p className="text-center mt-5 text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-gray-900 font-medium hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">Quick login</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setValue("email", "admin@lms.com"); setValue("password", "Admin@123"); }}
              className="flex-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer text-left"
            >
              <span className="font-medium block">Admin</span>
              <span className="text-gray-400">admin@lms.com</span>
            </button>
            <button
              type="button"
              onClick={() => { setValue("email", "studenta@lms.com"); setValue("password", "Student@123"); }}
              className="flex-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer text-left"
            >
              <span className="font-medium block">Student</span>
              <span className="text-gray-400">studenta@lms.com</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
