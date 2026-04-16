"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Building2,
  Ticket,
  CalendarCheck,
  Users,
  MessageSquare,
  Menu,
  LogOut,
  Sparkles,
} from "lucide-react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/cms/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/cms/branches", label: "지점관리", icon: Building2 },
  { href: "/cms/vouchers", label: "바우처관리", icon: Ticket },
  { href: "/cms/reservations", label: "예약관리", icon: CalendarCheck },
  { href: "/cms/users", label: "계정관리", icon: Users },
  { href: "/cms/sms-logs", label: "SMS 로그", icon: MessageSquare },
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
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function pageTitleFromPath(pathname: string): string {
  const match = navItems.find((item) => pathname.startsWith(item.href));
  return match?.label ?? "관리자";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-gold/20">
          <Sparkles className="size-4 text-brand-gold" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground">Medical Headspa</p>
          <p className="text-[10px] text-sidebar-foreground/50">관리자 시스템</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={pathname.startsWith(item.href)}
            onClick={() => setOpen(false)}
          />
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <ProtectedRoute allowedRoles={["super_admin"]}>
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:bg-sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile + Content */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg size-9 hover:bg-muted transition-colors">
                <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground">
              <SheetTitle className="sr-only">메뉴</SheetTitle>
              {sidebarContent}
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold">
            {pageTitleFromPath(pathname)}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
