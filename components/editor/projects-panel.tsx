"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Cloud,
  Trash2,
  Download,
  FileJson,
  FileSpreadsheet,
  Table2,
  Loader2,
  FolderOpen,
  CloudUpload,
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

interface Project {
  pathname: string;
  fileName: string;
  size: number;
  uploadedAt: string;
  url: string;
}

interface ProjectsPanelProps {
  onLoadProject: (content: string, fileName: string, fileType: FileType) => void;
  currentFileName: string;
  currentContent: string;
  currentFileType: FileType;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

export function ProjectsPanel({
  onLoadProject,
  currentFileName,
  currentContent,
  currentFileType,
}: ProjectsPanelProps) {
  const { data, error, isLoading } = useSWR<{ projects: Project[] }>(
    "/api/projects",
    fetcher
  );
  const [saving, setSaving] = useState(false);
  const [loadingProject, setLoadingProject] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  const handleSaveToCloud = async () => {
    if (!currentFileName || !currentContent) return;

    setSaving(true);
    try {
      const response = await fetch("/api/projects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentContent,
          fileName: currentFileName,
          fileType: currentFileType,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      // Refresh the projects list
      mutate("/api/projects");
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadProject = async (project: Project) => {
    setLoadingProject(project.pathname);
    try {
      const response = await fetch(
        `/api/projects/file?pathname=${encodeURIComponent(project.pathname)}`
      );
      if (!response.ok) throw new Error("Failed to load");

      const content = await response.text();
      const ext = project.fileName.split(".").pop()?.toLowerCase() as FileType;
      onLoadProject(content, project.fileName, ext || "json");
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoadingProject(null);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    setDeletingProject(project.pathname);
    try {
      const response = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: project.url }),
      });

      if (!response.ok) throw new Error("Failed to delete");

      // Refresh the projects list
      mutate("/api/projects");
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeletingProject(null);
    }
  };

  return (
    <Card className="h-full flex flex-col border-0 rounded-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="h-4 w-4" />
              Cloud Projects
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Save and load your datasets from the cloud
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleSaveToCloud}
            disabled={!currentFileName || saving}
            className="gap-1.5"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CloudUpload className="h-3.5 w-3.5" />
            )}
            Save Current
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading projects...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-destructive">
              Failed to load projects
            </div>
          ) : !data?.projects?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FolderOpen className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No saved projects yet</p>
              <p className="text-xs mt-1">Save your current dataset to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.projects.map((project) => (
                <div
                  key={project.pathname}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getFileIcon(project.fileName)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {project.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(project.size)} • {formatDate(project.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleLoadProject(project)}
                      disabled={loadingProject === project.pathname}
                    >
                      {loadingProject === project.pathname ? (
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
                          disabled={deletingProject === project.pathname}
                        >
                          {deletingProject === project.pathname ? (
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
                            This will permanently delete &quot;{project.fileName}&quot; from the cloud. This action cannot be undone.
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
