import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
        <Inbox className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {message && <p className="text-sm text-slate-500 mt-1 max-w-md">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
