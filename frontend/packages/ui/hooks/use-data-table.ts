import { useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";

interface UseDataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  initialSorting?: SortingState;
}

/**
 * Hook untuk DataTable server-side dengan sorting, filter, dan visibility.
 *
 * Contoh penggunaan:
 * ```tsx
 * const table = useDataTable({ data: projects, columns });
 * return <DataTable table={table} />;
 * ```
 */
export function useDataTable<TData>({
  data,
  columns,
  initialSorting = [],
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  const resetFilters = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter("");
    setSorting(initialSorting);
  }, [initialSorting]);

  return {
    table,
    globalFilter,
    setGlobalFilter,
    resetFilters,
    selectedRows: Object.keys(rowSelection).length,
  };
}
