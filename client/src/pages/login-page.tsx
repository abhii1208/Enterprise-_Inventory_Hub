import { useMutation } from "@tanstack/react-query";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { login, registerFirstAdmin } from "../api/auth";
import { queryClient } from "../app/query-client";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  name: string;
  email: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const loginForm = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterForm>({
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      toast.success(`Welcome, ${user.name}`);
      navigate(user.role === "ADMIN" ? "/admin/dashboard" : from, { replace: true });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Invalid email or password";

      toast.error(message);
    }
  });

  const registerMutation = useMutation({
    mutationFn: registerFirstAdmin,
    onSuccess: async () => {
      toast.success("Admin registered successfully. Please sign in.");
      registerForm.reset();
      setAuthMode("login");
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Registration failed";

      toast.error(message);
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-4 sm:px-4 sm:py-6">
      <div className="ambient-orb one" />
      <div className="ambient-orb two" />
      <div className="grid w-full max-w-[1180px] gap-4 lg:grid-cols-[0.96fr_0.9fr] lg:items-stretch">
        <Card className="panel-grid hidden overflow-hidden bg-mesh-fade p-7 xl:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Internal inventory
          </div>
          <h1 className="mt-4 max-w-lg font-display text-[42px] leading-tight text-ink">
            Inventory access built for fast daily operations.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted">
            Sign in to upload the active inventory workbook, search SKU codes, and work from the same saved master data across sessions.
          </p>

          <div className="mt-7 grid gap-3">
            {[
              {
                icon: <LockKeyhole className="h-5 w-5" />,
                title: "Secure workspace access",
                description: "Only signed-in users can access inventory data and operational tools."
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Stable saved inventory",
                description: "Uploaded master data stays available until it is replaced by a newer import."
              }
            ].map((item) => (
              <div key={item.title} className="interactive-lift rounded-3xl border border-line bg-white/72 p-4">
                <div className="inline-flex rounded-2xl bg-brand-50 p-2.5 text-brand-500">{item.icon}</div>
                <h2 className="mt-3 text-base font-semibold text-ink">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden p-4 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            {authMode === "register" ? "Register admin" : "Sign in"}
          </p>
          <h2 className="mt-2 font-display text-2xl text-ink sm:text-[40px]">Inventory Hub</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {authMode === "register"
              ? "Create the admin account from here, then sign in and continue into the workspace."
              : "Use your assigned credentials to enter the workspace."}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-white/70 p-1">
            <button
              type="button"
                className={`rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                authMode === "login" ? "bg-brand-500 text-white shadow-sm" : "text-muted hover:bg-white"
              }`}
              onClick={() => setAuthMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
                className={`rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                authMode === "register" ? "bg-brand-500 text-white shadow-sm" : "text-muted hover:bg-white"
              }`}
              onClick={() => setAuthMode("register")}
            >
              Register admin
            </button>
          </div>

          {authMode === "register" ? (
            <>
              <form
                className="mt-5 space-y-3.5"
                onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))}
              >
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Admin name</label>
                  <Input type="text" {...registerForm.register("name")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Admin email</label>
                  <Input type="email" {...registerForm.register("email")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Password</label>
                  <Input type="password" {...registerForm.register("password")} />
                </div>
                <Button className="w-full py-3" type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Registering..." : "Register admin"}
                </Button>
              </form>

              <div className="mt-4 rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-muted">
                <p className="font-semibold text-ink">Admin setup</p>
                <p className="mt-1">Use this form to create an admin account with your own credentials, then sign in.</p>
              </div>
            </>
          ) : (
            <>
              <form
                className="mt-5 space-y-3.5"
                onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}
              >
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Email</label>
                  <Input type="email" {...loginForm.register("email")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Password</label>
                  <Input type="password" {...loginForm.register("password")} />
                </div>
                <Button className="w-full py-3" type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Signing in..." : "Access workspace"}
                </Button>
              </form>

              <div className="mt-4 text-right">
                <Link to="/forgot-password" className="text-sm font-semibold text-brand-500 transition hover:text-brand-600">
                  Forgot password?
                </Link>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-muted">
                <p className="font-semibold text-ink">Need access?</p>
                <p className="mt-1">Ask an admin to create your account and share your credentials securely.</p>
                <div className="mt-2 inline-flex items-center gap-2 text-brand-500">
                  <ArrowRight className="h-4 w-4" />
                  Sign in to continue into the workspace.
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
