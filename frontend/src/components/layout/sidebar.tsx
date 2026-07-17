"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import {
  LayoutDashboard, FolderKanban, FileText, TrendingUp,
  Package, Warehouse, ShoppingCart, Users, Truck,
  DollarSign, FileInvoice, CheckSquare, Shield,
  FileImage, BarChart3, Bell, Settings, ChevronDown,
  Zap, LogOut, User, X,
} from "lucide-react";
import { useState } from "react";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FileInvoiceIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
  badge?: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard",   href: "/dashboard",  icon: LayoutDashboard },
  {
    label: "Project", icon: FolderKanban,
    children: [
      { label: "Semua Project", href: "/projects",           icon: FolderKanban, permission: "project.view" },
      { label: "Kontrak",       href: "/contracts",          icon: FileText,     permission: "contract.view" },
      { label: "Progress",      href: "/progress",           icon: TrendingUp,   permission: "progress.view" },
    ],
  },
  {
    label: "Operasional", icon: Package,
    children: [
      { label: "Material",  href: "/materials",  icon: Package,    permission: "material.view" },
      { label: "Gudang",    href: "/warehouses", icon: Warehouse,  permission: "warehouse.view" },
      { label: "Peralatan", href: "/equipment",  icon: Truck,      permission: "equipment.view" },
      { label: "SDM",       href: "/hr",         icon: Users,      permission: "hr.view" },
    ],
  },
  {
    label: "Pengadaan", icon: ShoppingCart,
    children: [
      { label: "Purchase Request", href: "/purchase-requests", icon: ShoppingCart,  permission: "purchase.view" },
      { label: "Purchase Order",   href: "/purchase-orders",   icon: FileText,      permission: "purchase.view" },
      { label: "Vendor",           href: "/vendors",           icon: Users,         permission: "vendor.view" },
    ],
  },
  {
    label: "Keuangan", icon: DollarSign,
    children: [
      { label: "Invoice",   href: "/invoices",  icon: FileInvoiceIcon, permission: "invoice.view" },
      { label: "Cashflow",  href: "/cashflows", icon: DollarSign,      permission: "finance.view" },
    ],
  },
  {
    label: "QC & HSE", icon: CheckSquare,
    children: [
      { label: "QC Inspeksi", href: "/qc",  icon: CheckSquare, permission: "qc.view" },
      { label: "HSE",         href: "/hse", icon: Shield,      permission: "hse.view" },
    ],
  },
  { label: "Gambar Kerja", href: "/drawings",      icon: FileImage,  permission: "drawing.view" },
  { label: "Laporan",      href: "/reports",       icon: BarChart3,  permission: "report.view" },
  { label: "Notifikasi",   href: "/notifications", icon: Bell },
  { label: "Setting",      href: "/settings",      icon: Settings,   permission: "setting.view" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, clearAuth, hasPermission } = useAuthStore();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(["Project"]);

  async function handleLogout() {
    try { await authService.logout(); } catch {}
    clearAuth();
    router.replace("/login");
  }

  function toggleGroup(label: string) {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  function canView(item: NavItem): boolean {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">PLN ERP</div>
            <div className="text-slate-500 text-xs mt-0.5">Smart Construction</div>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item) => {
          if (!canView(item)) return null;

          if (item.children) {
            const isExpanded = expanded.includes(item.label);
            const isActive = item.children.some((c) => c.href && pathname.startsWith(c.href));

            return (
              <div key={item.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-sm font-medium transition-colors",
                    isActive ? "text-white bg-slate-800" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                </button>
                {isExpanded && (
                  <div className="mt-1 ml-3 pl-4 border-l border-slate-800 space-y-0.5">
                    {item.children.filter(canView).map((child) => {
                      const isChildActive = pathname === child.href || (child.href && pathname.startsWith(child.href + "/"));
                      return (
                        <Link
                          key={child.href}
                          href={child.href!}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm transition-colors",
                            isChildActive
                              ? "text-white bg-blue-600"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                          )}
                        >
                          <child.icon className="w-4 h-4 shrink-0" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href || (item.href && item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium mb-1 transition-colors",
                isActive
                  ? "text-white bg-blue-600"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 p-2 rounded-[8px] hover:bg-slate-800 transition-colors group">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name ?? "User"}</div>
            <div className="text-slate-500 text-xs truncate">{user?.roles?.[0]?.display_name ?? user?.roles?.[0]?.name}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all p-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
