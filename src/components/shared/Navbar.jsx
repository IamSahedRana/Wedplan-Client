"use client";

import { ChevronDown, LayoutDashboard, LogOut, Menu, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
];

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const dashboardHref = user ? `/dashboard/${user.role || "customer"}` : null;

  async function handleSignOut() {
    await authClient.signOut();
    toast.success("Signed out successfully");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-accent hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isPending ? (
            <div className="hidden h-9 w-40 animate-pulse rounded-full bg-muted md:block" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border py-1 pe-2 ps-1 transition hover:bg-muted">
                  <Avatar className="size-8">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref}>
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`${dashboardHref}/profile`}>
                    <Settings className="size-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-error focus:text-error">
                  <LogOut className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-secondary-foreground transition hover:bg-accent hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="my-3 h-px bg-border" />

                {user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
                      <Avatar className="size-9">
                        {user.image && <AvatarImage src={user.image} alt={user.name} />}
                        <AvatarFallback className="bg-primary text-sm font-semibold text-white">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setOpen(false)}
                      className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-accent hover:text-primary"
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                    <Link
                      href={`${dashboardHref}/profile`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-accent hover:text-primary"
                    >
                      <Settings className="size-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-error transition hover:bg-error-tint"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/signin" onClick={() => setOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="rounded-full">
                      <Link href="/signup" onClick={() => setOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
