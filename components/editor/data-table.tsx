"use client";

import { useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DataRow, ColumnStats } from "@/lib/types";
import { ColumnHeader } from "./column-header";

interface DataTableProps {
  rows: DataRow[];
  columns: string[];
  columnStats: Map<string, ColumnStats>;
  selectedRow: number | null;
  onSelectRow: (index: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  modifiedRows: Set<number>;
}

export function DataTable({
  rows,
  columns,
  columnStats,
  selectedRow,
  onSelectRow,
  searchQuery,
  onSearchChange,
  currentPage,
  onPageChange,
  pageSize,
  modifiedRows,
}: DataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const query = searchQuery.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const val = row[col];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [rows, columns, searchQuery]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);
  const paginatedRows = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const rowVirtualizer = useVirtualizer({
    count: paginatedRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const truncateText = useCallback((text: unknown, maxLength = 100): string => {
    if (text === null || text === undefined) return "";
    const str = typeof text === "object" ? JSON.stringify(text) : String(text);
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  }, []);

  const getPageNumbers = useCallback(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push("...");
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search this dataset"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(0);
            }}
            className="bg-secondary pl-9"
          />
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex border-b border-border bg-card">
        <div className="w-20 shrink-0 border-r border-border px-3 py-2">
          <div className="text-xs font-medium text-muted-foreground">_row_index</div>
          <div className="text-[10px] text-muted-foreground/60">int64</div>
        </div>
        {columns.map((col) => (
          <ColumnHeader key={col} column={col} stats={columnStats.get(col)} />
        ))}
      </div>

      {/* Data Rows */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = paginatedRows[virtualRow.index];
            const isSelected = selectedRow === row._index;
            const isModified = modifiedRows.has(row._index);

            return (
              <div
                key={row._index}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={`absolute left-0 top-0 flex w-full cursor-pointer border-b border-border transition-colors hover:bg-secondary/50 ${
                  isSelected ? "bg-primary/10" : ""
                } ${isModified ? "border-l-2 border-l-chart-5" : ""}`}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onSelectRow(row._index)}
              >
                <div className="flex w-20 shrink-0 items-center border-r border-border px-3 py-3">
                  <span className="text-sm text-muted-foreground">
                    {row._index}
                  </span>
                </div>
                {columns.map((col) => (
                  <div
                    key={col}
                    className="flex min-w-[200px] flex-1 items-center border-r border-border px-3 py-3"
                  >
                    <span className="line-clamp-2 text-sm text-foreground">
                      {truncateText(row[col])}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-border bg-card px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) =>
              typeof page === "string" ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="min-w-[32px]"
                >
                  {page + 1}
                </Button>
              )
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
