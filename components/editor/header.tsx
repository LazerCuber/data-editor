"use client";

import { Database, FileJson, Upload, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  fileName: string;
  totalRows: number;
  fileType: "json" | "jsonl";
  hasChanges: boolean;
  onUpload: () => void;
  onExportJSON: () => void;
  onExportJSONL: () => void;
}

export function Header({
  fileName,
  totalRows,
  fileType,
  hasChanges,
  onUpload,
  onExportJSON,
  onExportJSONL,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Datasets:
          </span>
        </div>
        {fileName ? (
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{fileName}</span>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {fileType.toUpperCase()}
            </span>
            {hasChanges && (
              <span className="rounded bg-chart-5/20 px-2 py-0.5 text-xs text-chart-5">
                Modified
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">No file loaded</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {totalRows > 0 && (
          <span className="text-sm text-muted-foreground">
            {totalRows.toLocaleString()} rows
          </span>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onUpload}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>

        {totalRows > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportJSONL}>
                <FileJson className="mr-2 h-4 w-4" />
                Export as JSONL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportJSON}>
                <FileJson className="mr-2 h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
