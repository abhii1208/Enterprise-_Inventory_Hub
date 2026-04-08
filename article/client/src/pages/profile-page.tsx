import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { changePassword, requestChangePasswordOtp } from "../api/auth";
import { useAuth } from "../features/auth/use-auth";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { formatDate } from "../lib/utils";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  otp: string;
};

export function ProfilePage() {
  const { data: user } = useAuth();
  const [otpRequested, setOtpRequested] = useState(false);
  const form = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      otp: ""
    }
  });

  const otpMutation = useMutation({
    mutationFn: requestChangePasswordOtp,
    onSuccess: () => {
      setOtpRequested(true);
      toast.success("OTP sent to your email");
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password updated");
      setOtpRequested(false);
      form.reset();
    }
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="bg-mesh-fade p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Profile</p>
        <h2 className="mt-2 font-display text-4xl text-ink">{user?.name}</h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-line bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Email</p>
            <p className="mt-2 text-sm font-medium text-ink">{user?.email}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Role</p>
            <p className="mt-2 text-sm font-medium text-ink">{user?.role}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Created</p>
            <p className="mt-2 text-sm font-medium text-ink">{formatDate(user?.createdAt)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Security</p>
        <h3 className="mt-2 font-display text-3xl text-ink">Change password</h3>
        <p className="mt-3 text-sm leading-6 text-muted">
          Request an OTP first. Until that verification code is issued, the password cannot be changed.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit((values) => changePasswordMutation.mutate(values))}
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Current password</label>
            <Input type="password" {...form.register("currentPassword")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">New password</label>
            <Input type="password" {...form.register("newPassword")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">OTP</label>
            <Input type="text" inputMode="numeric" maxLength={6} disabled={!otpRequested} {...form.register("otp")} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              disabled={otpMutation.isPending}
              onClick={() => otpMutation.mutate({ currentPassword: form.getValues("currentPassword") })}
            >
              {otpMutation.isPending ? "Sending OTP..." : "Send OTP"}
            </Button>
            <Button type="submit" disabled={changePasswordMutation.isPending || !otpRequested}>
              {changePasswordMutation.isPending ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
