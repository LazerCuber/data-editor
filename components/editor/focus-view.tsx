"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  RotateCcw,
  Copy,
  Check,
  Rows3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DataRow } from "@/lib/types";

interface FocusViewProps {
  rows: DataRow[];
  columns: string[];
  visibleColumns: Set<string>;
  startIndex: number;
  modifiedRows: Set<number>;
  onSave: (rowIndex: number, data: Record<string, unknown>) => void;
  onClose: () => void;
}

export function FocusView({
  rows,
  columns,
  visibleColumns,
  startIndex,
  modifiedRows,
  onSave,
  onClose,
}: FocusViewProps) {
  const [cursor, setCursor] = useState(startIndex);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const lastLoadedRowRef = useRef<number | null>(null);

  // Memoize activeCols to prevent recreation on every render
  const activeCols = useMemo(
    () => columns.filter((c) => visibleColumns.has(c)),
    [columns, visibleColumns]
  );
  const currentRow = rows[cursor];

  // Load row values into state
  useEffect(() => {
    if (!currentRow) return;
    // Prevent infinite loop by tracking last loaded row
    if (lastLoadedRowRef.current === currentRow._index) return;
    lastLoadedRowRef.current = currentRow._index;

    const vals: Record<string, string> = {};
    for (const col of activeCols) {
      const v = currentRow[col];
      vals[col] =
        v === null || v === undefined
          ? ""
          : typeof v === "object"
          ? JSON.stringify(v, null, 2)
          : String(v);
    }
    setEditedValues(vals);
    setHasUnsaved(false);
  }, [cursor, currentRow, activeCols]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" || (e.altKey && e.key === "ArrowUp")) {
        if (cursor > 0) setCursor(cursor - 1);
      }
      if (e.key === "ArrowRight" || (e.altKey && e.key === "ArrowDown")) {
        if (cursor < rows.length - 1) setCursor(cursor + 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [cursor, rows.length, onClose]);

  const goTo = useCallback((idx: number) => {
    setCursor(idx);
  }, []);

  const handleChange = (col: string, val: string) => {
    setEditedValues((prev) => ({ ...prev, [col]: val }));
    setHasUnsaved(true);
  };

  const handleSave = () => {
    if (!currentRow) return;
    const parsed: Record<string, unknown> = {};
    for (const col of activeCols) {
      const val = editedValues[col] ?? "";
      if (val.trim().startsWith("{") || val.trim().startsWith("[")) {
        try {
          parsed[col] = JSON.parse(val);
        } catch {
          parsed[col] = val;
        }
      } else if (val === "") {
        parsed[col] = null;
      } else if (!isNaN(Number(val)) && val.trim() !== "") {
        parsed[col] = Number(val);
      } else {
        parsed[col] = val;
      }
    }
    onSave(currentRow._index, parsed);
    setHasUnsaved(false);
  };

  const handleSaveAndNext = () => {
    handleSave();
    if (cursor < rows.length - 1) goTo(cursor + 1);
  };

  const handleReset = useCallback(() => {
    if (!currentRow) return;
    lastLoadedRowRef.current = null; // Force reload
    const vals: Record<string, string> = {};
    for (const col of activeCols) {
      const v = currentRow[col];
      vals[col] =
        v === null || v === undefined
          ? ""
          : typeof v === "object"
          ? JSON.stringify(v, null, 2)
          : String(v);
    }
    setEditedValues(vals);
    setHasUnsaved(false);
  }, [currentRow, activeCols]);

  const handleCopy = async (col: string) => {
    await navigator.clipboard.writeText(editedValues[col] ?? "");
    setCopiedField(col);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!currentRow) return null;

  const isModified = modifiedRows.has(currentRow._index);
  const progress = ((cursor + 1) / rows.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
            <X className="h-4 w-4" />
            Close
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Rows3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Focus View
            </span>
          </div>
          {isModified && (
            <span className="rounded bg-chart-5/20 px-2 py-0.5 text-xs text-chart-5">
              Modified
            </span>
          )}
          {hasUnsaved && (
            <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
              Unsaved
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goTo(cursor - 1)}
            disabled={cursor === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          <span className="min-w-[80px] text-center text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{cursor + 1}</span>
            {" / "}
            {rows.length.toLocaleString()}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => goTo(cursor + 1)}
            disabled={cursor >= rows.length - 1}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5" disabled={!hasUnsaved}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button variant="default" size="sm" onClick={handleSaveAndNext} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save & Next
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Row meta */}
      <div className="flex items-center gap-3 border-b border-border bg-card/40 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          _row_index:{" "}
          <span className="font-mono text-foreground">{currentRow._index}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Showing columns:{" "}
          <span className="text-foreground">{activeCols.join(", ")}</span>
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          Tip: use arrow keys to navigate rows
        </span>
      </div>

      {/* Content: side-by-side fields */}
      <div className="flex flex-1 overflow-hidden">
        {activeCols.map((col, i) => (
          <div
            key={col}
            className={cn(
              "flex flex-1 flex-col overflow-hidden",
              i < activeCols.length - 1 && "border-r border-border"
            )}
          >
            {/* Field header */}
            <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleCopy(col)}
              >
                {copiedField === col ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* Textarea */}
            <div className="flex-1 p-3">
              <Textarea
                value={editedValues[col] ?? ""}
                onChange={(e) => handleChange(col, e.target.value)}
                className="h-full min-h-full w-full resize-none bg-secondary/40 font-mono text-sm leading-relaxed focus-visible:ring-1"
                placeholder={`Enter ${col}...`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
