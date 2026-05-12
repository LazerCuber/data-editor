"use client";

import { useCallback, useState } from "react";
import { Upload, FileJson, X, AlertCircle, FileSpreadsheet, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FileType as DataFileType } from "@/lib/types";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onFileLoad: (content: string | ArrayBuffer, fileName: string, fileType: DataFileType) => void;
}

export function UploadModal({ open, onClose, onFileLoad }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      const fileName = file.name;
      const ext = fileName.split(".").pop()?.toLowerCase();

      const supportedFormats = ["json", "jsonl", "csv", "parquet"];
      if (!ext || !supportedFormats.includes(ext)) {
        throw new Error("Please upload a .json, .jsonl, .csv, or .parquet file");
      }

      const fileType = ext as DataFileType;

      if (fileType === "parquet") {
        const buffer = await file.arrayBuffer();
        onFileLoad(buffer, fileName, fileType);
      } else {
        const content = await file.text();
        onFileLoad(content, fileName, fileType);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file");
    } finally {
      setIsLoading(false);
    }
  }, [onFileLoad, onClose]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Upload Dataset
          </DialogTitle>
          <DialogDescription>
            Upload a dataset file to view and edit your data.
          </DialogDescription>
        </DialogHeader>

        <div
          className={`relative mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="mb-2 text-center text-sm font-medium text-foreground">
            Drop your file here, or browse
          </p>
          <p className="mb-4 text-center text-xs text-muted-foreground">
            Supports .json, .jsonl, .csv, and .parquet files
          </p>
          <input
            type="file"
            accept=".json,.jsonl,.csv,.parquet"
            onChange={handleFileSelect}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isLoading}
          />
          <Button variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? "Loading..." : "Browse Files"}
          </Button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
