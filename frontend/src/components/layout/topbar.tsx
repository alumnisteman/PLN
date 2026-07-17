"use client";

import { Menu, Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-base font-semibold text-slate-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search hint */}
        <button className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400",
          "border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
        )}>
          <Search className="w-4 h-4" />
          <span>Cari...</span>
          <kbd className="ml-2 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono">⌘K</kbd>
        </button>

        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.charAt(0) ?? "U"}
        </div>
      </div>
    </header>
  );
}
