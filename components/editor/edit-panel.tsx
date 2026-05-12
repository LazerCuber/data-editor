"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, FileJson, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { DataRow } from "@/lib/types";

interface EditPanelProps {
  selectedRow: DataRow | null;
  columns: string[];
  onSave: (rowIndex: number, data: Record<string, unknown>) => void;
}

export function EditPanel({ selectedRow, columns, onSave }: EditPanelProps) {
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRow) {
      const values: Record<string, string> = {};
      for (const col of columns) {
        const val = selectedRow[col];
        values[col] = val === null || val === undefined 
          ? "" 
          : typeof val === "object" 
            ? JSON.stringify(val, null, 2) 
            : String(val);
      }
      setEditedValues(values);
    } else {
      setEditedValues({});
    }
  }, [selectedRow, columns]);

  const handleCopy = async (field: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = () => {
    if (!selectedRow) return;
    
    const parsed: Record<string, unknown> = {};
    for (const col of columns) {
      const val = editedValues[col];
      // Try to parse as JSON if it looks like JSON
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
    
    onSave(selectedRow._index, parsed);
  };

  const handleReset = () => {
    if (selectedRow) {
      const values: Record<string, string> = {};
      for (const col of columns) {
        const val = selectedRow[col];
        values[col] = val === null || val === undefined 
          ? "" 
          : typeof val === "object" 
            ? JSON.stringify(val, null, 2) 
            : String(val);
      }
      setEditedValues(values);
    }
  };

  if (!selectedRow) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-card p-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
          <FileJson className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Row Editor
        </h3>
        <p className="max-w-[280px] text-sm text-muted-foreground">
          Select a row from the table to view and edit its content here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Row #{selectedRow._index}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 space-y-4 overflow-auto p-4">
        {columns.map((col) => (
          <div key={col} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                {col}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleCopy(col, editedValues[col] || "")}
              >
                {copiedField === col ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </Button>
            </div>
            <Textarea
              value={editedValues[col] || ""}
              onChange={(e) =>
                setEditedValues((prev) => ({ ...prev, [col]: e.target.value }))
              }
              className="min-h-[120px] resize-y bg-secondary font-mono text-sm"
              placeholder={`Enter ${col}...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
