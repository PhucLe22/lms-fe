import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import type { RegisterRequest } from "../../types";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";
import type { AxiosError } from "axios";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } =
    useForm<RegisterRequest>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await authApi.register(data);
      login(res.data);
      navigate("/");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card padding="lg" className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Create an account
        </h1>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...register("fullName", {
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
          />

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
            placeholder="At least 6 characters"
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
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
