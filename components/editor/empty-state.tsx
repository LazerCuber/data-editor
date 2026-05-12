"use client";

import { Database, Upload, FileJson } from "lucide-react";
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
        JSONL Data Editor
      </h2>
      <p className="mb-6 max-w-md text-center text-muted-foreground">
        Upload your JSONL or JSON dataset to view, edit, and export your data
        with perfect format preservation.
      </p>
      <Button onClick={onUpload} size="lg" className="gap-2">
        <Upload className="h-4 w-4" />
        Upload Dataset
      </Button>
      <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileJson className="h-3.5 w-3.5" />
          <span>Supports .json & .jsonl</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>Large file support</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>Edit & export</span>
        </div>
      </div>
    </div>
  );
}
