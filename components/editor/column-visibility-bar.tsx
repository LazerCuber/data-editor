"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ColumnVisibilityBarProps {
  columns: string[];
  visibleColumns: Set<string>;
  onToggleColumn: (col: string) => void;
  onShowAll: () => void;
}

export function ColumnVisibilityBar({
  columns,
  visibleColumns,
  onToggleColumn,
  onShowAll,
}: ColumnVisibilityBarProps) {
  const allVisible = columns.every((c) => visibleColumns.has(c));

  return (
    <div className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2 overflow-x-auto">
      <div className="flex items-center gap-1.5 shrink-0">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Columns:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* _row_index is always shown — it's the table index, not toggleable */}
        <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground cursor-default select-none">
          _row_index
        </span>

        {columns.map((col) => {
          const isVisible = visibleColumns.has(col);
          return (
            <button
              key={col}
              onClick={() => onToggleColumn(col)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer select-none",
                isVisible
                  ? "border-primary/50 bg-primary/15 text-primary hover:bg-primary/25"
                  : "border-border/40 bg-secondary/30 text-muted-foreground/50 hover:bg-secondary/60 hover:text-muted-foreground"
              )}
            >
              {isVisible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              {col}
            </button>
          );
        })}
      </div>

      {!allVisible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowAll}
          className="h-6 shrink-0 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Show all
        </Button>
      )}
    </div>
  );
}
