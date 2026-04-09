import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { requestForgotPasswordOtp, resetForgotPassword, verifyForgotPasswordOtp } from "../api/auth";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";

type ForgotPasswordForm = {
  email: string;
  otp: string;
  newPassword: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
  ) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallback;
  }

  return fallback;
}

export function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
      otp: "",
      newPassword: ""
    }
  });
  const [verified, setVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const sendOtpMutation = useMutation({
    mutationFn: requestForgotPasswordOtp,
    onSuccess: () => {
      setVerified(false);
      setStatusMessage("OTP sent successfully. Check the registered email inbox and spam folder.");
      toast.success("OTP sent successfully");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Could not send OTP");
      setStatusMessage(message);
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyForgotPasswordOtp,
    onSuccess: () => {
      setVerified(true);
      setStatusMessage("OTP verified successfully. You can now set the new password.");
      toast.success("OTP verified successfully");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "OTP verification failed");
      setStatusMessage(message);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetForgotPassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      setStatusMessage("Password updated successfully. You can sign in now.");
      setVerified(false);
      form.reset();
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Password reset failed");
      setStatusMessage(message);
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-4 sm:px-4 sm:py-6">
      <div className="ambient-orb one" />
      <div className="ambient-orb two" />
      <Card className="relative w-full max-w-3xl overflow-hidden p-4 sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Forgot password</p>
            <h1 className="mt-2 font-display text-2xl text-ink sm:text-[40px]">Reset access securely</h1>
          </div>
          <div className="hidden rounded-full border border-line bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-500 sm:inline-flex sm:items-center sm:gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Email OTP
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Request an OTP, verify it, then update your password. This page is designed to fit on one screen without scrolling on normal laptop sizes.
        </p>

        {statusMessage ? (
          <div className="mt-4 rounded-2xl border border-line bg-white/75 px-4 py-3 text-sm text-muted">{statusMessage}</div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Email</label>
            <Input type="email" {...form.register("email")} />
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">OTP</label>
              <Input maxLength={6} placeholder="Enter OTP" {...form.register("otp")} />
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={sendOtpMutation.isPending}
              onClick={form.handleSubmit((values) => sendOtpMutation.mutate({ email: values.email }))}
            >
              {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={verifyOtpMutation.isPending}
              onClick={form.handleSubmit((values) =>
                verifyOtpMutation.mutate({ email: values.email, otp: values.otp })
              )}
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>

          {verified ? (
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">New password</label>
                <Input type="password" placeholder="Enter new password" {...form.register("newPassword")} />
              </div>
              <Button
                type="button"
                disabled={resetPasswordMutation.isPending}
                onClick={form.handleSubmit((values) =>
                  resetPasswordMutation.mutate({ email: values.email, newPassword: values.newPassword })
                )}
              >
                {resetPasswordMutation.isPending ? "Updating..." : "Update password"}
              </Button>
            </div>
          ) : null}
        </form>

        <div className="mt-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
