"use client";

import {
  CalendarCheck,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  PlusCircle,
  ReceiptText,
  Store,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

import { Logo } from "@/components/shared/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { invalidateToken } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV_BY_ROLE = {
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vendor/my-services", label: "My Services", icon: Store },
    { href: "/dashboard/vendor/add-service", label: "Add Service", icon: PlusCircle },
    { href: "/dashboard/vendor/bookings", label: "Booking Requests", icon: CalendarClock },
    { href: "/dashboard/vendor/subscription", label: "Subscription", icon: CreditCard },
    { href: "/dashboard/vendor/profile", label: "Profile Settings", icon: UserCog },
  ],
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/bookings", label: "My Bookings", icon: CalendarCheck },
    { href: "/dashboard/customer/profile", label: "Profile Settings", icon: UserCog },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/services", label: "Manage Services", icon: PackageSearch },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: ReceiptText },
    { href: "/dashboard/admin/profile", label: "Profile Settings", icon: UserCog },
  ],
};

const ROLE_LABELS = { vendor: "Vendor", customer: "Customer", admin: "Admin" };

function NavItems({ role, pathname, onNavigate }) {
  const items = NAV_BY_ROLE[role] || [];
  const overviewHref = `/dashboard/${role}`;

  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === overviewHref ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-accent text-primary"
                : "text-secondary-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {active && (
              <span className="absolute start-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMiniCard({ user, onLogout }) {
  return (
    <div className="mt-auto border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
        <Avatar className="size-9">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-accent text-primary">
            {(user.name || "U").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          title="Log out"
          className="shrink-0 rounded-full text-muted-foreground hover:text-error"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function DashboardShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const role = user.role;
  const roleLabel = ROLE_LABELS[role] || "Dashboard";

  async function handleLogout() {
    await authClient.signOut();
    invalidateToken();
    toast.success("Signed out");
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-border bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo href={`/dashboard/${role}`} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <NavItems role={role} pathname={pathname} />
          <UserMiniCard user={user} onLogout={handleLogout} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile drawer */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
                <div className="flex h-full flex-col">
                  <div className="flex h-16 items-center border-b border-border px-5">
                    <Logo href={`/dashboard/${role}`} />
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col">
                    <NavItems
                      role={role}
                      pathname={pathname}
                      onNavigate={() => setDrawerOpen(false)}
                    />
                    <UserMiniCard user={user} onLogout={handleLogout} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-sm font-semibold text-foreground sm:text-base">
              {roleLabel} Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="hidden rounded-full sm:inline-flex">
              <Link href="/">View Site</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Log out"
              className="rounded-full text-muted-foreground hover:text-error"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="container-page flex-1 py-8">{children}</main>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-64 shrink-0 flex-col gap-4 border-e border-border bg-white p-4 lg:flex">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Skeleton className="h-16 w-full rounded-none" />
        <div className="container-page space-y-6 py-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
