"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CalendarCheck, Settings, Menu } from "lucide-react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

const navItems = [
  { href: "/my-branch", label: "내 지점 예약", icon: CalendarCheck },
  { href: "/my-branch/settings", label: "설정", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export default function BranchAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["branch_admin", "super_admin"]}>
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:bg-sidebar">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/my-branch" className="text-lg font-bold tracking-tight">
            지점 관리
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={pathname === item.href}
            />
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg size-8 hover:bg-muted transition-colors">
                <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              <SheetTitle className="sr-only">메뉴</SheetTitle>
              <div className="flex h-14 items-center border-b px-4">
                <span className="text-lg font-bold tracking-tight">
                  지점 관리
                </span>
              </div>
              <Separator />
              <nav className="space-y-1 p-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    {...item}
                    active={pathname === item.href}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">
            {pathname === "/my-branch/settings" ? "설정" : "내 지점 예약"}
          </h1>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
