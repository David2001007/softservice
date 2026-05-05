import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { DefaultButton } from "./default-button";

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  className?: string;
  headerClassName?: string;
  cell?: (item: T) => React.ReactNode;
}

interface DefaultTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
  
  // Paginação
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
  };
}

export function DefaultTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  emptyMessage = "Nenhum registro encontrado",
  onRowClick,
  rowClassName,
  pagination,
}: DefaultTableProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                {columns.map((col, index) => (
                  <TableHead 
                    key={index} 
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
                      col.headerClassName
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Carregando dados...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      onRowClick && "cursor-pointer transition-colors hover:bg-muted/30",
                      typeof rowClassName === "function" ? rowClassName(item) : rowClassName
                    )}
                  >
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className={cn("py-3 md:py-4", col.className)}>
                        {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey] ?? "") : null)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-b-xl border-t bg-muted/30 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <p className="text-center text-xs text-muted-foreground tabular-nums md:text-left">
            Mostrando <span className="font-medium text-foreground">
              {(pagination.currentPage - 1) * (pagination.itemsPerPage || 10) + 1}
            </span>–
            <span className="font-medium text-foreground">
              {Math.min(pagination.currentPage * (pagination.itemsPerPage || 10), pagination.totalItems || 0)}
            </span> de{" "}
            <span className="font-medium text-foreground">{pagination.totalItems}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1 md:justify-end">
            <DefaultButton
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            />

            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              let page: number;
              if (pagination.totalPages <= 5) {
                page = i + 1;
              } else if (pagination.currentPage <= 3) {
                page = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                page = pagination.totalPages - 4 + i;
              } else {
                page = pagination.currentPage - 2 + i;
              }
              return (
                <DefaultButton
                  key={page}
                  variant={pagination.currentPage === page ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 text-xs font-medium ${
                    pagination.currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => pagination.onPageChange(page)}
                  label={String(page)}
                />
              );
            })}

            <DefaultButton
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              leftIcon={<ChevronRight className="w-4 h-4" />}
            />
          </div>
        </div>
      )}
    </div>
  );
}
