"use client";

import { ChevronDown } from "lucide-react";
import type { ColumnStats } from "@/lib/types";

interface ColumnHeaderProps {
  column: string;
  stats?: ColumnStats;
}

export function ColumnHeader({ column, stats }: ColumnHeaderProps) {
  const maxBarHeight = 24;
  const maxCount = stats ? Math.max(...stats.distribution, 1) : 1;

  return (
    <div className="min-w-[200px] flex-1 border-r border-border px-3 py-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-foreground">{column}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="text-[10px] text-muted-foreground/60">
            {stats?.type || "unknown"} · lengths
          </div>
        </div>
      </div>
      
      {/* Mini distribution chart */}
      {stats && (
        <div className="mt-1.5 flex items-end gap-0.5">
          {stats.distribution.map((count, i) => (
            <div
              key={i}
              className="w-2 rounded-sm bg-chart-1/60"
              style={{
                height: `${Math.max(2, (count / maxCount) * maxBarHeight)}px`,
              }}
            />
          ))}
        </div>
      )}
      
      {stats && (
        <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground/50">
          <span>{stats.minLength.toLocaleString()}</span>
          <span>{stats.maxLength.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
