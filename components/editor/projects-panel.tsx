"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  Download,
  FileJson,
  FileSpreadsheet,
  Table2,
  Loader2,
  FolderOpen,
  Save,
  AlertTriangle,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileType } from "@/lib/types";

interface ProjectMetadata {
  id: string;
  fileName: string;
  fileType: FileType;
  rowCount: number;
  columnCount: number;
  columns: string[];
  savedAt: string;
  size: number; // Approximate size in bytes
  isLargeDataset: boolean;
}

interface ProjectsPanelProps {
  onLoadProject: (content: string, fileName: string, fileType: FileType) => void;
  currentFileName: string;
  currentContent: string;
  currentFileType: FileType;
  currentRowCount?: number;
  currentColumns?: string[];
}

const STORAGE_KEY = "data-editor-projects";
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB localStorage limit safety margin
const LARGE_DATASET_THRESHOLD = 1000; // Rows threshold for "large dataset" warning

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    case "parquet":
      return <Table2 className="h-4 w-4 text-purple-500" />;
    default:
      return <FileJson className="h-4 w-4 text-blue-500" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStorageUsage(): number {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith("data-editor")) {
      total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
    }
  }
  return total;
}

export function ProjectsPanel({
  onLoadProject,
  currentFileName,
  currentContent,
  currentFileType,
  currentRowCount = 0,
  currentColumns = [],
}: ProjectsPanelProps) {
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingProject, setLoadingProject] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [storageUsage, setStorageUsage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load projects from localStorage
  const loadProjects = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProjectMetadata[];
        setProjects(parsed.sort((a, b) => 
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        ));
      }
      setStorageUsage(getStorageUsage());
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Failed to load saved projects");
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSaveProject = async () => {
    if (!currentFileName || !currentContent) return;

    setSaving(true);
    setError(null);

    try {
      const contentSize = currentContent.length * 2;
      const currentUsage = getStorageUsage();
      
      // Check if we'd exceed storage limits
      if (currentUsage + contentSize > MAX_STORAGE_SIZE) {
        setError(`Storage limit exceeded. Current usage: ${formatFileSize(currentUsage)}. Please delete some projects first.`);
        setSaving(false);
        return;
      }

      const id = `project-${Date.now()}`;
      const isLargeDataset = currentRowCount > LARGE_DATASET_THRESHOLD;

      // Save metadata
      const metadata: ProjectMetadata = {
        id,
        fileName: currentFileName,
        fileType: currentFileType,
        rowCount: currentRowCount,
        columnCount: currentColumns.length,
        columns: currentColumns,
        savedAt: new Date().toISOString(),
        size: contentSize,
        isLargeDataset,
      };

      // Save content separately
      localStorage.setItem(`data-editor-content-${id}`, currentContent);

      // Update projects list
      const existingProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as ProjectMetadata[];
      const updatedProjects = [metadata, ...existingProjects];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));

      loadProjects();
    } catch (err) {
      console.error("Failed to save project:", err);
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        setError("Storage quota exceeded. Please delete some projects to free up space.");
      } else {
        setError("Failed to save project");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLoadProject = async (project: ProjectMetadata) => {
    setLoadingProject(project.id);
    setError(null);

    try {
      const content = localStorage.getItem(`data-editor-content-${project.id}`);
      if (!content) {
        throw new Error("Project data not found");
      }
      onLoadProject(content, project.fileName, project.fileType);
    } catch (err) {
      console.error("Failed to load project:", err);
      setError("Failed to load project");
    } finally {
      setLoadingProject(null);
    }
  };

  const handleDeleteProject = async (project: ProjectMetadata) => {
    setDeletingProject(project.id);
    setError(null);

    try {
      // Remove content
      localStorage.removeItem(`data-editor-content-${project.id}`);

      // Update projects list
      const existingProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as ProjectMetadata[];
      const updatedProjects = existingProjects.filter((p) => p.id !== project.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));

      loadProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("Failed to delete project");
    } finally {
      setDeletingProject(null);
    }
  };

  const isCurrentTooLarge = currentContent.length * 2 + getStorageUsage() > MAX_STORAGE_SIZE;

  return (
    <Card className="h-full flex flex-col border-0 rounded-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4" />
              Local Projects
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Save datasets locally in your browser
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleSaveProject}
            disabled={!currentFileName || saving || isCurrentTooLarge}
            className="gap-1.5"
            title={isCurrentTooLarge ? "Dataset too large to save locally" : undefined}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Current
          </Button>
        </div>
        
        {/* Storage indicator */}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min((storageUsage / MAX_STORAGE_SIZE) * 100, 100)}%` }}
            />
          </div>
          <span>{formatFileSize(storageUsage)} / {formatFileSize(MAX_STORAGE_SIZE)}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 p-0">
        {error && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
        
        <ScrollArea className="h-full px-4 pb-4">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FolderOpen className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No saved projects yet</p>
              <p className="text-xs mt-1">Save your current dataset to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getFileIcon(project.fileName)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {project.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project.rowCount.toLocaleString()} rows, {project.columnCount} cols
                        {" "}({formatFileSize(project.size)})
                        {" "}({formatDate(project.savedAt)})
                      </p>
                    </div>
                    {project.isLargeDataset && (
                      <span className="shrink-0 rounded bg-chart-5/20 px-1.5 py-0.5 text-[10px] text-chart-5">
                        Large
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleLoadProject(project)}
                      disabled={loadingProject === project.id}
                    >
                      {loadingProject === project.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={deletingProject === project.id}
                        >
                          {deletingProject === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{project.fileName}&quot; from local storage. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProject(project)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
