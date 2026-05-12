"use client";

import { useState, useCallback, useMemo } from "react";
import { Header } from "./header";
import { DataTable } from "./data-table";
import { EditPanel } from "./edit-panel";
import { UploadModal } from "./upload-modal";
import { EmptyState } from "./empty-state";
import {
  parseJSONL,
  parseJSON,
  exportToJSONL,
  exportToJSON,
  getColumns,
  getColumnStats,
} from "@/lib/data-store";
import type { DataRow, ColumnStats } from "@/lib/types";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function JSONLEditor() {
  const [rows, setRows] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<"json" | "jsonl">("jsonl");
  const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const PAGE_SIZE = 25;

  const selectedRow = useMemo(() => {
    if (selectedRowIndex === null) return null;
    return rows.find((r) => r._index === selectedRowIndex) || null;
  }, [rows, selectedRowIndex]);

  const columnStats = useMemo(() => {
    const stats = new Map<string, ColumnStats>();
    for (const col of columns) {
      stats.set(col, getColumnStats(rows, col));
    }
    return stats;
  }, [rows, columns]);

  const handleFileLoad = useCallback(
    (content: string, name: string, type: "json" | "jsonl") => {
      try {
        const parsedRows = type === "jsonl" ? parseJSONL(content) : parseJSON(content);
        const cols = getColumns(parsedRows);

        setRows(parsedRows);
        setColumns(cols);
        setFileName(name);
        setFileType(type);
        setModifiedRows(new Set());
        setSelectedRowIndex(null);
        setSearchQuery("");
        setCurrentPage(0);
      } catch (err) {
        console.error("Failed to parse file:", err);
      }
    },
    []
  );

  const handleSaveRow = useCallback(
    (rowIndex: number, data: Record<string, unknown>) => {
      setRows((prev) =>
        prev.map((row) =>
          row._index === rowIndex ? { ...row, ...data } : row
        )
      );
      setModifiedRows((prev) => new Set(prev).add(rowIndex));
    },
    []
  );

  const handleExportJSONL = useCallback(() => {
    const content = exportToJSONL(rows);
    downloadFile(content, fileName.replace(/\.(json|jsonl)$/, ".jsonl"), "application/x-jsonlines");
  }, [rows, fileName]);

  const handleExportJSON = useCallback(() => {
    const content = exportToJSON(rows);
    downloadFile(content, fileName.replace(/\.(json|jsonl)$/, ".json"), "application/json");
  }, [rows, fileName]);

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header
        fileName={fileName}
        totalRows={rows.length}
        fileType={fileType}
        hasChanges={modifiedRows.size > 0}
        onUpload={() => setUploadModalOpen(true)}
        onExportJSON={handleExportJSON}
        onExportJSONL={handleExportJSONL}
      />

      {rows.length === 0 ? (
        <EmptyState onUpload={() => setUploadModalOpen(true)} />
      ) : (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={65} minSize={40}>
            <DataTable
              rows={rows}
              columns={columns}
              columnStats={columnStats}
              selectedRow={selectedRowIndex}
              onSelectRow={setSelectedRowIndex}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pageSize={PAGE_SIZE}
              modifiedRows={modifiedRows}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={25}>
            <EditPanel
              selectedRow={selectedRow}
              columns={columns}
              onSave={handleSaveRow}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onFileLoad={handleFileLoad}
      />
    </div>
  );
}
