"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":          "Dashboard",
  "/projects":           "Manajemen Project",
  "/contracts":          "Kontrak",
  "/progress":           "Progress Lapangan",
  "/materials":          "Material",
  "/warehouses":         "Gudang",
  "/equipment":          "Peralatan",
  "/hr":                 "SDM",
  "/purchase-requests":  "Purchase Request",
  "/purchase-orders":    "Purchase Order",
  "/vendors":            "Vendor",
  "/invoices":           "Invoice",
  "/cashflows":          "Cashflow",
  "/qc":                 "QC Inspeksi",
  "/hse":                "HSE",
  "/drawings":           "Gambar Kerja",
  "/reports":            "Laporan",
  "/notifications":      "Notifikasi",
  "/master":             "Data Master",
  "/settings":           "Pengaturan",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const title = PAGE_TITLES[pathname] ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
