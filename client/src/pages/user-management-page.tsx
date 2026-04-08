import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createUser as createUserRequest,
  deleteUser as deleteUserRequest,
  fetchUsers,
  requestResetPasswordOtp,
  resetPassword as resetPasswordRequest,
  verifyResetPasswordOtp,
  toggleUserStatus,
  updateUser as updateUserRequest
} from "../api/admin";
import { queryClient } from "../app/query-client";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { DataTable } from "../components/ui/data-table";
import { EmptyState } from "../components/ui/empty-state";
import { Input } from "../components/ui/input";
import { Modal } from "../components/ui/modal";
import { Select } from "../components/ui/select";
import type { AppUser } from "../lib/types";
import { formatDate } from "../lib/utils";
import { useAuth } from "../features/auth/use-auth";

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
};

type EditForm = {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
};

export function UserManagementPage() {
  const { data: authUser } = useAuth();
  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchUsers
  });
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<AppUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState("Reset@12345");
  const [resetOtp, setResetOtp] = useState("");
  const [resetOtpRequested, setResetOtpRequested] = useState(false);
  const [resetOtpVerified, setResetOtpVerified] = useState(false);
  const [resetStatus, setResetStatus] = useState<string>("");

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

  const createForm = useForm<UserForm>({
    defaultValues: { name: "", email: "", password: "", role: "USER" }
  });
  const editForm = useForm<EditForm>({
    values: selectedUser
      ? {
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          isActive: selectedUser.isActive
        }
      : { name: "", email: "", role: "USER", isActive: true }
  });

  const refresh = async () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const createMutation = useMutation({
    mutationFn: createUserRequest,
    onSuccess: async () => {
      toast.success("User created");
      createForm.reset();
      setShowCreateModal(false);
      await refresh();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; values: EditForm }) => updateUserRequest(payload.id, payload.values),
    onSuccess: async () => {
      toast.success("User updated");
      setSelectedUser(null);
      await refresh();
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleUserStatus(id, isActive),
    onSuccess: async (_, variables) => {
      toast.success(variables.isActive ? "User activated" : "User deactivated");
      await refresh();
    }
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => resetPasswordRequest(id, password),
    onSuccess: async () => {
      toast.success("Password reset");
      setResetTarget(null);
      setNewPassword("Reset@12345");
      setResetOtp("");
      setResetOtpRequested(false);
      setResetOtpVerified(false);
      setResetStatus("");
      await refresh();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Password reset failed");
      setResetStatus(message);
      toast.error(message);
    }
  });
  const requestResetOtpMutation = useMutation({
    mutationFn: (id: string) => requestResetPasswordOtp(id),
    onSuccess: () => {
      setResetOtpRequested(true);
      setResetOtpVerified(false);
      setResetStatus("OTP sent successfully");
      toast.success("OTP sent successfully");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "OTP could not be sent");
      setResetStatus(message);
      toast.error(message);
    }
  });
  const verifyResetOtpMutation = useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => verifyResetPasswordOtp(id, otp),
    onSuccess: () => {
      setResetOtpVerified(true);
      setResetStatus("OTP verified successfully");
      toast.success("OTP verified successfully");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "OTP verification failed");
      setResetStatus(message);
      toast.error(message);
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserRequest(id),
    onSuccess: async () => {
      toast.success("User deleted permanently");
      setDeleteTarget(null);
      await refresh();
    }
  });

  const users = usersQuery.data ?? [];
  const canCreateUser = authUser?.role === "ADMIN";
  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.isActive).length,
      admins: users.filter((user) => user.role === "ADMIN").length
    }),
    [users]
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="section-title">User management</h2>
        <p className="section-subtitle">
          Provision access, update roles, reset passwords, and keep account status tightly controlled.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Total users", stats.total],
          ["Active users", stats.active],
          ["Admin accounts", stats.admins]
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
            <p className="mt-3 font-display text-4xl text-ink">{value}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Access control</p>
            <h3 className="mt-2 font-display text-2xl text-ink">Team members and admin accounts</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Open a full-size popup to add new users with their own credentials and roles.
            </p>
          </div>
          {canCreateUser ? (
            <Button onClick={() => setShowCreateModal(true)}>Add new user</Button>
          ) : (
            <div className="text-sm text-muted">Only admins can create new accounts.</div>
          )}
        </div>

        <DataTable
          rows={users}
          empty={<EmptyState title="No users yet" description="Create the first user account to start managing access." />}
          columns={[
            {
              key: "user",
              title: "User",
              render: (user) => (
                <div>
                  <p className="font-semibold text-ink">{user.name}</p>
                  <p className="mt-1 text-xs text-muted">{user.email}</p>
                </div>
              )
            },
            {
              key: "role",
              title: "Role",
              render: (user) => <Badge>{user.role}</Badge>
            },
            {
              key: "status",
              title: "Status",
              render: (user) => (
                <Badge className={user.isActive ? "border-brand-100 bg-brand-50 text-brand-600" : "text-danger"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              )
            },
            {
              key: "createdAt",
              title: "Created",
              render: (user) => <span className="text-sm text-muted">{formatDate(user.createdAt)}</span>
            },
            {
              key: "actions",
              title: "Actions",
              className: "min-w-[240px]",
              render: (user) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setSelectedUser(user)}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => setResetTarget(user)}>
                    Reset password
                  </Button>
                  {canCreateUser ? (
                    <Button variant="danger" onClick={() => setDeleteTarget(user)}>
                      Delete forever
                    </Button>
                  ) : null}
                  <Button
                    variant={user.isActive ? "danger" : "primary"}
                    onClick={() => toggleMutation.mutate({ id: user.id, isActive: !user.isActive })}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              )
            }
          ]}
        />
      </section>

      <Modal
        open={showCreateModal}
        title="Add a new member or admin"
        description="Create a user in a larger workspace with enough room to enter their name, email, password, and role cleanly."
        confirmLabel={createMutation.isPending ? "Creating..." : "Create user"}
        panelClassName="max-w-3xl p-8"
        onClose={() => {
          setShowCreateModal(false);
          createForm.reset();
        }}
        onConfirm={createForm.handleSubmit((values) => createMutation.mutate(values))}
      >
        <form className="mt-2 grid gap-5 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink">Full name</label>
            <Input {...createForm.register("name")} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink">Email</label>
            <Input type="email" {...createForm.register("email")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Password</label>
            <Input type="password" {...createForm.register("password")} />
            <p className="mt-2 text-xs text-muted">Use a password with at least 8 characters.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Role</label>
            <Select {...createForm.register("role")}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </Select>
            <p className="mt-2 text-xs text-muted">Choose `Admin` when this person should manage access too.</p>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(selectedUser)}
        title="Edit user"
        description="Update user details and account status."
        confirmLabel={updateMutation.isPending ? "Saving..." : "Save changes"}
        onClose={() => setSelectedUser(null)}
        onConfirm={editForm.handleSubmit((values) => {
          if (selectedUser) {
            updateMutation.mutate({ id: selectedUser.id, values });
          }
        })}
      >
        <div className="grid gap-4">
          <Input placeholder="Name" {...editForm.register("name")} />
          <Input placeholder="Email" type="email" {...editForm.register("email")} />
          <Select {...editForm.register("role")}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <Select
            value={String(editForm.watch("isActive"))}
            onChange={(event) => editForm.setValue("isActive", event.target.value === "true")}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete user permanently"
        description={`This will permanently delete ${deleteTarget?.email ?? "this user"}. This action cannot be undone.`}
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete forever"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
      />

      <Modal
        open={Boolean(resetTarget)}
        title="Reset password"
        description={`Set a new password for ${resetTarget?.email ?? "this user"}. An OTP sent to the admin email is required before the reset can be completed.`}
        confirmLabel={resetMutation.isPending ? "Resetting..." : "Reset password"}
        confirmHidden={!resetOtpVerified}
        confirmDisabled={!resetOtpVerified || newPassword.trim().length < 8 || resetMutation.isPending}
        onClose={() => {
          setResetTarget(null);
          setResetOtp("");
          setResetOtpRequested(false);
          setResetOtpVerified(false);
          setNewPassword("Reset@12345");
          setResetStatus("");
        }}
        onConfirm={() => {
          if (resetTarget && resetOtpVerified) {
            resetMutation.mutate({ id: resetTarget.id, password: newPassword });
          } else {
            toast.error("Verify the OTP before resetting the password");
          }
        }}
      >
        <div className="grid gap-4">
          {resetStatus ? (
            <div className="rounded-2xl border border-line bg-white/75 px-4 py-3 text-sm text-ink">{resetStatus}</div>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            disabled={!resetTarget || requestResetOtpMutation.isPending}
            onClick={() => {
              if (resetTarget) {
                requestResetOtpMutation.mutate(resetTarget.id);
              }
            }}
          >
            {requestResetOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
          </Button>
          <Input
            value={resetOtp}
            onChange={(event) => setResetOtp(event.target.value)}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter OTP"
          />
          {resetOtpRequested ? (
            <Button
              type="button"
              variant="secondary"
              disabled={!resetTarget || verifyResetOtpMutation.isPending || resetOtp.trim().length !== 6}
              onClick={() => {
                if (resetTarget) {
                  verifyResetOtpMutation.mutate({ id: resetTarget.id, otp: resetOtp });
                }
              }}
            >
              {verifyResetOtpMutation.isPending ? "Verifying OTP..." : "Verify OTP"}
            </Button>
          ) : null}
          {resetOtpVerified ? (
            <div>
              <Input
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                placeholder="Enter new password"
              />
              <p className="mt-2 text-xs text-muted">Use a password with at least 8 characters.</p>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
