import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/authApi";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      await authApi.resetPassword(token, data.newPassword);
      setSuccess(true);
    } catch {
      setError("Failed to reset password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card padding="lg" className="w-full max-w-sm">
          <Alert variant="error">
            Invalid or missing reset token.
          </Alert>
          <p className="text-center mt-4 text-sm text-gray-500">
            <Link to="/forgot-password" className="text-gray-900 font-medium hover:underline">
              Request a new reset link
            </Link>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card padding="lg" className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Reset password
        </h1>

        {success ? (
          <div className="space-y-4">
            <Alert variant="success">
              Your password has been reset successfully.
            </Alert>
            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-gray-900 font-medium hover:underline">
                Log in with your new password
              </Link>
            </p>
          </div>
        ) : (
          <>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New password"
                type="password"
                placeholder="Enter new password"
                error={errors.newPassword?.message}
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />

              <Input
                label="Confirm password"
                type="password"
                placeholder="Confirm new password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("newPassword") || "Passwords do not match",
                })}
              />

              <Button type="submit" loading={isLoading} className="w-full">
                {isLoading ? "Resetting..." : "Reset password"}
              </Button>
            </form>

            <p className="text-center mt-5 text-sm text-gray-500">
              <Link to="/login" className="text-gray-900 font-medium hover:underline">
                Back to login
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
