"use client";

import { Database, Upload, FileJson, FileSpreadsheet, Table2, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onUpload: () => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
        <Database className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">
        Data Editor
      </h2>
      <p className="mb-6 max-w-md text-center text-muted-foreground">
        Upload your dataset to view, edit, and export your data
        with perfect format preservation and cloud storage.
      </p>
      <Button onClick={onUpload} size="lg" className="gap-2">
        <Upload className="h-4 w-4" />
        Upload Dataset
      </Button>
      
      {/* Supported Formats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
          <FileJson className="h-6 w-6 text-chart-1" />
          <span className="text-xs font-medium text-foreground">JSON</span>
          <span className="text-[10px] text-muted-foreground">Structured data</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
          <FileJson className="h-6 w-6 text-chart-2" />
          <span className="text-xs font-medium text-foreground">JSONL</span>
          <span className="text-[10px] text-muted-foreground">Line-delimited</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
          <FileSpreadsheet className="h-6 w-6 text-chart-3" />
          <span className="text-xs font-medium text-foreground">CSV</span>
          <span className="text-[10px] text-muted-foreground">Spreadsheets</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
          <Table2 className="h-6 w-6 text-chart-4" />
          <span className="text-xs font-medium text-foreground">Parquet</span>
          <span className="text-[10px] text-muted-foreground">Columnar format</span>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-chart-1" />
          <span>Large file support</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-chart-2" />
          <span>Column statistics</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-chart-3" />
          <span>Edit & export</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cloud className="h-3.5 w-3.5" />
          <span>Cloud storage</span>
        </div>
      </div>
    </div>
  );
}
