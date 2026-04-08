import { ChevronDown, Database, FileClock, KeyRound, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, Upload, Users } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../api/auth";
import { useAuth } from "../../features/auth/use-auth";
import { queryClient } from "../../app/query-client";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/import", label: "Import", icon: Upload },
  { to: "/admin/current-rows", label: "Current rows", icon: Database },
  { to: "/admin/import-history", label: "History", icon: FileClock },
  { to: "/admin/audit-logs", label: "Audit", icon: ShieldCheck }
];

export function AppLayout() {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/login");
    }
  });

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="ambient-orb one" />
      <div className="ambient-orb two" />
      <div className="page-shell grid items-start gap-5 lg:h-screen lg:grid-cols-[260px_minmax(0,1fr)] lg:overflow-hidden">
        <aside
          className={cn(
            "surface tilt-sheen hidden h-[calc(100vh-3rem)] flex-col overflow-hidden p-4 lg:sticky lg:top-6 lg:flex",
            open && "flex"
          )}
        >
          <BrandBlock />
          <Navigation
            userRole={user?.role}
            showUserMenu={showUserMenu}
            onToggleUserMenu={() => setShowUserMenu((value) => !value)}
          />
          <SidebarFooter
            name={user?.name ?? ""}
            email={user?.email ?? ""}
            onLogout={() => logoutMutation.mutate()}
          />
        </aside>

        <div className="lg:hidden">
          <div className="surface flex items-center justify-between px-4 py-3">
            <BrandBlock compact />
            <Button variant="secondary" onClick={() => setOpen((value) => !value)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          {open ? (
            <div className="surface mt-3 p-4">
              <Navigation
                userRole={user?.role}
                mobile
                showUserMenu={showUserMenu}
                onToggleUserMenu={() => setShowUserMenu((value) => !value)}
                onNavigate={() => setOpen(false)}
              />
              <SidebarFooter
                name={user?.name ?? ""}
                email={user?.email ?? ""}
                onLogout={() => logoutMutation.mutate()}
              />
            </div>
          ) : null}
        </div>

        <main className="relative min-w-0 lg:col-start-2 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
          <header className="surface tilt-sheen mb-5 px-5 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                  Internal Inventory Workspace
                </p>
                <h1 className="mt-2 font-display text-3xl text-ink">Inventory Hub</h1>
                <p className="mt-2 text-sm text-muted">Saved inventory, faster lookups, and cleaner daily operations.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                <div className="rounded-2xl border border-line bg-white/70 px-4 py-2">
                  Signed in as <span className="font-semibold text-ink">{user?.name}</span>
                </div>
                <Button variant="ghost" onClick={() => navigate("/profile")}>
                  <KeyRound className="h-4 w-4" />
                  Profile
                </Button>
              </div>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function BrandBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("mb-6", compact && "mb-0")}>
      <div className="inline-flex items-center gap-3">
        <div className="rounded-2xl bg-brand-500 p-3 text-white shadow-soft">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Enterprise</p>
          <h2 className="font-display text-2xl text-ink">Inventory Hub</h2>
        </div>
      </div>
    </div>
  );
}

function Navigation({
  userRole,
  showUserMenu,
  onToggleUserMenu,
  mobile = false,
  onNavigate
}: {
  userRole?: "ADMIN" | "USER";
  showUserMenu: boolean;
  onToggleUserMenu: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const visibleAdminLinks = adminLinks.filter((link) => link.to !== "/admin/users");

  return (
    <nav className="flex flex-1 flex-col gap-2">
      {userRole ? (
        <>
          <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Administration</p>
          {visibleAdminLinks.map((link) => (
            <NavItem key={link.to} {...link} onNavigate={onNavigate} />
          ))}
          {userRole === "ADMIN" ? (
            <div className="mt-2 rounded-2xl border border-line bg-white/55 p-2">
              <button
                type="button"
                onClick={onToggleUserMenu}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-white/75 hover:text-ink"
              >
                <span className="flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  User access
                </span>
                <ChevronDown className={cn("h-4 w-4 transition", showUserMenu && "rotate-180")} />
              </button>
              {showUserMenu ? (
                <div className="mt-2">
                  <NavItem to="/admin/users" label="Users" icon={Users} onNavigate={onNavigate} nested />
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
      {mobile ? <div className="pt-4" /> : null}
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  onNavigate,
  nested = false
}: {
  to: string;
  label: string;
  icon: typeof Search;
  onNavigate?: () => void;
  nested?: boolean;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-white/70 hover:text-ink",
          nested && "ml-2 border border-line/70 bg-white/70",
          isActive && "bg-white text-ink shadow-sm"
        )
      }
    >
      <Icon className="h-4 w-4 transition group-hover:scale-105" />
      {label}
    </NavLink>
  );
}

function SidebarFooter({
  name,
  email,
  onLogout
}: {
  name: string;
  email: string;
  onLogout: () => void;
}) {
  return (
    <div className="mt-6 rounded-3xl border border-line bg-white/75 p-4">
      <p className="text-sm font-semibold text-ink">{name}</p>
      <p className="mt-1 text-xs text-muted">{email}</p>
      <div className="soft-divider mt-4" />
      <Button className="mt-4 w-full" variant="secondary" onClick={onLogout}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
