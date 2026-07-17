import { useState, useCallback } from "react";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve?: (confirmed: boolean) => void;
}

/**
 * Hook untuk menampilkan dialog konfirmasi secara programatik.
 *
 * Contoh penggunaan:
 * ```tsx
 * const { confirm, ConfirmDialog } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({ title: "Hapus data?", description: "..." });
 *   if (ok) await deleteData();
 * };
 * ```
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: "Konfirmasi",
    description: "Apakah Anda yakin ingin melanjutkan?",
    confirmLabel: "Ya, Lanjutkan",
    cancelLabel: "Batal",
  });

  const confirm = useCallback((options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title ?? "Konfirmasi",
        description: options.description ?? "Apakah Anda yakin ingin melanjutkan?",
        confirmLabel: options.confirmLabel ?? "Ya, Lanjutkan",
        cancelLabel: options.cancelLabel ?? "Batal",
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, isOpen: false }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, isOpen: false }));
  }, [state]);

  return {
    confirm,
    confirmState: state,
    handleConfirm,
    handleCancel,
  };
}
