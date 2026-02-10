import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card padding="lg" className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Forgot password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <div className="space-y-4">
            <Alert variant="success">
              Check your email for a password reset link.
            </Alert>
            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-gray-900 font-medium hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        ) : (
          <>
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

              <Button type="submit" loading={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </form>

            <p className="text-center mt-5 text-sm text-gray-500">
              Remember your password?{" "}
              <Link to="/login" className="text-gray-900 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
