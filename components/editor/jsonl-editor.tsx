"use client";

import { useState, useCallback, useMemo } from "react";
import { Header } from "./header";
import { DataTable } from "./data-table";
import { EditPanel } from "./edit-panel";
import { UploadModal } from "./upload-modal";
import { EmptyState } from "./empty-state";
import { FocusView } from "./focus-view";
import { RawView } from "./raw-view";
import { ProjectsPanel } from "./projects-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Table } from "lucide-react";
import {
  parseJSONL,
  parseJSON,
  parseCSV,
  parseParquet,
  exportToJSONL,
  exportToJSON,
  exportToCSV,
  generateRawContent,
  getColumns,
  getColumnStats,
} from "@/lib/data-store";
import type { DataRow, ColumnStats, FileType } from "@/lib/types";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function JSONLEditor() {
  const [rows, setRows] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<FileType>("jsonl");
  const [rawContent, setRawContent] = useState<string>("");
  const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [focusViewStart, setFocusViewStart] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [activeTab, setActiveTab] = useState<"editor" | "projects">("editor");

  // Generate current content for cloud save
  const currentContent = useMemo(() => {
    if (rows.length === 0) return "";
    return generateRawContent(rows, fileType);
  }, [rows, fileType]);

  const handleLoadFromCloud = useCallback(
    (content: string, name: string, type: FileType) => {
      try {
        let parsedRows: DataRow[];

        switch (type) {
          case "jsonl":
            parsedRows = parseJSONL(content);
            break;
          case "json":
            parsedRows = parseJSON(content);
            break;
          case "csv":
            parsedRows = parseCSV(content);
            break;
          default:
            throw new Error("Unsupported file type from cloud");
        }

        const cols = getColumns(parsedRows);

        setRows(parsedRows);
        setColumns(cols);
        setVisibleColumns(new Set(cols));
        setFileName(name);
        setFileType(type);
        setRawContent(content);
        setModifiedRows(new Set());
        setSelectedRowIndex(null);
        setSearchQuery("");
        setCurrentPage(0);
        setFocusViewStart(null);
        setActiveTab("editor");
      } catch (err) {
        console.error("Failed to parse cloud file:", err);
      }
    },
    []
  );

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
    async (content: string | ArrayBuffer, name: string, type: FileType) => {
      try {
        let parsedRows: DataRow[];
        let originalContent: string;

        switch (type) {
          case "jsonl":
            parsedRows = parseJSONL(content as string);
            originalContent = content as string;
            break;
          case "json":
            parsedRows = parseJSON(content as string);
            originalContent = content as string;
            break;
          case "csv":
            parsedRows = parseCSV(content as string);
            originalContent = content as string;
            break;
          case "parquet":
            parsedRows = await parseParquet(content as ArrayBuffer);
            originalContent = generateRawContent(parsedRows, type);
            break;
          default:
            throw new Error("Unsupported file type");
        }

        const cols = getColumns(parsedRows);

        setRows(parsedRows);
        setColumns(cols);
        setVisibleColumns(new Set(cols));
        setFileName(name);
        setFileType(type);
        setRawContent(originalContent);
        setModifiedRows(new Set());
        setSelectedRowIndex(null);
        setSearchQuery("");
        setCurrentPage(0);
        setFocusViewStart(null);
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

  const handleToggleColumn = useCallback((col: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) {
        // Don't hide if it's the last visible column
        if (next.size <= 1) return prev;
        next.delete(col);
      } else {
        next.add(col);
      }
      return next;
    });
  }, []);

  const handleShowAllColumns = useCallback(() => {
    setVisibleColumns(new Set(columns));
  }, [columns]);

  const handleExportJSONL = useCallback(() => {
    const content = exportToJSONL(rows);
    downloadFile(
      content,
      fileName.replace(/\.(json|jsonl|csv|parquet)$/i, ".jsonl"),
      "application/x-jsonlines"
    );
  }, [rows, fileName]);

  const handleExportJSON = useCallback(() => {
    const content = exportToJSON(rows);
    downloadFile(
      content,
      fileName.replace(/\.(json|jsonl|csv|parquet)$/i, ".json"),
      "application/json"
    );
  }, [rows, fileName]);

  const handleExportCSV = useCallback(() => {
    const content = exportToCSV(rows);
    downloadFile(
      content,
      fileName.replace(/\.(json|jsonl|csv|parquet)$/i, ".csv"),
      "text/csv"
    );
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
        onExportCSV={handleExportCSV}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "projects" ? (
        <ProjectsPanel
          onLoadProject={handleLoadFromCloud}
          currentFileName={fileName}
          currentContent={currentContent}
          currentFileType={fileType}
        />
      ) : rows.length === 0 ? (
        <EmptyState onUpload={() => setUploadModalOpen(true)} />
      ) : viewMode === "raw" ? (
        <RawView
          content={rawContent}
          fileType={fileType}
          fileName={fileName}
        />
      ) : (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={65} minSize={40}>
            <DataTable
              rows={rows}
              columns={columns}
              visibleColumns={visibleColumns}
              onToggleColumn={handleToggleColumn}
              onShowAllColumns={handleShowAllColumns}
              columnStats={columnStats}
              selectedRow={selectedRowIndex}
              onSelectRow={setSelectedRowIndex}
              onOpenFocusView={setFocusViewStart}
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
              columns={columns.filter((c) => visibleColumns.has(c))}
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

      {focusViewStart !== null && (
        <FocusView
          rows={rows}
          columns={columns}
          visibleColumns={visibleColumns}
          startIndex={focusViewStart}
          modifiedRows={modifiedRows}
          onSave={handleSaveRow}
          onClose={() => setFocusViewStart(null)}
        />
      )}
    </div>
  );
}
