"use client";

import { useCallback, useState } from "react";
import { Upload, FileJson, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onFileLoad: (content: string, fileName: string, fileType: "json" | "jsonl") => void;
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

      if (ext !== "json" && ext !== "jsonl") {
        throw new Error("Please upload a .json or .jsonl file");
      }

      const content = await file.text();
      const fileType = ext as "json" | "jsonl";

      onFileLoad(content, fileName, fileType);
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
            <FileJson className="h-5 w-5 text-primary" />
            Upload Dataset
          </DialogTitle>
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
            Supports .json and .jsonl files
          </p>
          <input
            type="file"
            accept=".json,.jsonl"
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
