"use client";

import { useMemo } from "react";
import {
  FileJson,
  FileSpreadsheet,
  Table2,
  Rows3,
  Columns3,
  Clock,
  HardDrive,
  Hash,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FileType } from "@/lib/types";

interface ProjectsPanelProps {
  currentFileName: string;
  currentContent: string;
  currentFileType: FileType;
  currentRowCount?: number;
  currentColumns?: string[];
}

function getFileIcon(fileType: FileType) {
  switch (fileType) {
    case "csv":
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    case "parquet":
      return <Table2 className="h-5 w-5 text-violet-500" />;
    default:
      return <FileJson className="h-5 w-5 text-sky-500" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ProjectsPanel({
  currentFileName,
  currentContent,
  currentFileType,
  currentRowCount = 0,
  currentColumns = [],
}: ProjectsPanelProps) {
  const fileStats = useMemo(() => {
    const sizeInBytes = new Blob([currentContent]).size;
    const lineCount = currentContent.split("\n").length;
    const charCount = currentContent.length;
    
    return {
      size: sizeInBytes,
      lines: lineCount,
      characters: charCount,
    };
  }, [currentContent]);

  const hasFile = currentFileName && currentContent;

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      {hasFile ? (
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              {getFileIcon(currentFileType)}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg font-semibold truncate">
                  {currentFileName}
                </CardTitle>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                  {currentFileType} file
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              {/* Rows */}
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <Rows3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{currentRowCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Rows</p>
                </div>
              </div>
              
              {/* Columns */}
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <Columns3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{currentColumns.length}</p>
                  <p className="text-xs text-muted-foreground">Columns</p>
                </div>
              </div>
              
              {/* File Size */}
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{formatFileSize(fileStats.size)}</p>
                  <p className="text-xs text-muted-foreground">Size</p>
                </div>
              </div>
              
              {/* Lines */}
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{fileStats.lines.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Lines</p>
                </div>
              </div>
            </div>
            
            {/* Column List */}
            {currentColumns.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentColumns.slice(0, 10).map((col) => (
                    <span
                      key={col}
                      className="rounded-md bg-secondary px-2 py-1 text-xs text-foreground"
                    >
                      {col}
                    </span>
                  ))}
                  {currentColumns.length > 10 && (
                    <span className="rounded-md bg-secondary/50 px-2 py-1 text-xs text-muted-foreground">
                      +{currentColumns.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Timestamp */}
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Loaded just now</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center text-center text-muted-foreground">
          <FileJson className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No file loaded</p>
          <p className="text-xs mt-1">Upload a file to see its details here</p>
        </div>
      )}
    </div>
  );
}
