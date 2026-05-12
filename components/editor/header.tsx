"use client";

import { Database, FileJson, Upload, Download, ChevronDown, FileSpreadsheet, Table2, FileCode, LayoutGrid, Cloud, TableProperties } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FileType } from "@/lib/types";

interface HeaderProps {
  fileName: string;
  totalRows: number;
  fileType: FileType;
  hasChanges: boolean;
  onUpload: () => void;
  onExportJSON: () => void;
  onExportJSONL: () => void;
  onExportCSV: () => void;
  viewMode: "table" | "raw";
  onViewModeChange: (mode: "table" | "raw") => void;
  activeTab: "editor" | "projects";
  onTabChange: (tab: "editor" | "projects") => void;
}

const getFileIcon = (type: FileType) => {
  switch (type) {
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />;
    case "parquet":
      return <Table2 className="h-4 w-4 text-muted-foreground" />;
    default:
      return <FileJson className="h-4 w-4 text-muted-foreground" />;
  }
};

export function Header({
  fileName,
  totalRows,
  fileType,
  hasChanges,
  onUpload,
  onExportJSON,
  onExportJSONL,
  onExportCSV,
  viewMode,
  onViewModeChange,
  activeTab,
  onTabChange,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold text-foreground">
            Data Editor
          </span>
        </div>
        
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={(value) => value && onTabChange(value as "editor" | "projects")}
          className="border border-border rounded-md"
        >
          <ToggleGroupItem value="editor" aria-label="Editor" className="gap-1.5 px-3">
            <TableProperties className="h-4 w-4" />
            <span className="hidden sm:inline">Editor</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="projects" aria-label="Projects" className="gap-1.5 px-3">
            <Cloud className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </ToggleGroupItem>
        </ToggleGroup>
        {fileName ? (
          <div className="flex items-center gap-2">
            {getFileIcon(fileType)}
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
          <>
            <span className="text-sm text-muted-foreground">
              {totalRows.toLocaleString()} rows
            </span>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && onViewModeChange(value as "table" | "raw")}
              className="border border-border rounded-md"
            >
              <ToggleGroupItem value="table" aria-label="Table view" className="gap-1.5 px-3">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="raw" aria-label="Raw view" className="gap-1.5 px-3">
                <FileCode className="h-4 w-4" />
                <span className="hidden sm:inline">Raw</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </>
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
              <DropdownMenuItem onClick={onExportCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
