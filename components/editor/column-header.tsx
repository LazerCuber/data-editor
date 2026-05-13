"use client";

import { ChevronDown } from "lucide-react";
import type { ColumnStats } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ColumnHeaderProps {
  column: string;
  stats?: ColumnStats;
}

export function ColumnHeader({ column, stats }: ColumnHeaderProps) {
  const maxBarHeight = 24;
  const maxCount = stats ? Math.max(...stats.distribution, 1) : 1;
  const totalCount = stats ? stats.distribution.reduce((a, b) => a + b, 0) : 0;

  // Calculate bin ranges for tooltips
  const getBinRange = (binIndex: number, numBins: number) => {
    if (!stats) return "";
    const range = stats.maxLength - stats.minLength;
    const binSize = range / numBins;
    const start = Math.round(stats.minLength + binIndex * binSize);
    const end = Math.round(stats.minLength + (binIndex + 1) * binSize);
    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-w-[120px] flex-1 border-r border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-foreground">{column}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help text-[10px] text-muted-foreground/60">
                  {stats?.type || "unknown"} · lengths
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-xs">
                  <strong>Data type:</strong> {stats?.type || "unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Shows the distribution of value lengths in this column
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Mini distribution chart */}
        {stats && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-1.5 flex cursor-help items-end gap-0.5">
                {stats.distribution.map((count, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-2 rounded-sm bg-chart-1/60 transition-colors hover:bg-chart-1"
                        style={{
                          height: `${Math.max(2, (count / maxCount) * maxBarHeight)}px`,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p><strong>Range:</strong> {getBinRange(i, stats.distribution.length)} chars</p>
                      <p><strong>Count:</strong> {count.toLocaleString()} ({totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0}%)</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs font-medium">Length Distribution Histogram</p>
              <p className="text-xs text-muted-foreground">
                Each bar shows how many values fall within a length range. Hover over individual bars for details.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {stats && (
          <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{stats.minLength.toLocaleString()}</span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Minimum length: {stats.minLength.toLocaleString()} characters</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{stats.maxLength.toLocaleString()}</span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Maximum length: {stats.maxLength.toLocaleString()} characters</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
