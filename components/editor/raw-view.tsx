"use client";

import { useState, useMemo } from "react";
import { Copy, Check, FileCode, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileType } from "@/lib/types";

interface RawViewProps {
  content: string;
  fileType: FileType;
  fileName: string;
}

export function RawView({ content, fileType, fileName }: RawViewProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lines = useMemo(() => content.split("\n"), [content]);

  const filteredLines = useMemo(() => {
    if (!searchQuery.trim()) return lines.map((line, i) => ({ line, index: i }));
    const query = searchQuery.toLowerCase();
    return lines
      .map((line, i) => ({ line, index: i }))
      .filter(({ line }) => line.toLowerCase().includes(query));
  }, [lines, searchQuery]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSyntaxHighlight = (line: string): string => {
    // Basic syntax highlighting class based on content
    if (fileType === "json" || fileType === "jsonl") {
      if (line.includes(":")) return "text-foreground";
    }
    return "text-foreground";
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <FileCode className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">Raw File View</span>
          <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {fileType.toUpperCase()}
          </span>
          <span className="text-sm text-muted-foreground">
            {lines.length.toLocaleString()} lines
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy All
            </>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="border-b border-border px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search in file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary pl-9"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-xs text-muted-foreground">
            {filteredLines.length} matching lines
          </p>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <pre className="font-mono text-sm">
            <code>
              {filteredLines.map(({ line, index }) => (
                <div
                  key={index}
                  className="flex hover:bg-secondary/30"
                >
                  <span className="mr-4 w-12 shrink-0 select-none text-right text-muted-foreground/50">
                    {index + 1}
                  </span>
                  <span className={`flex-1 whitespace-pre-wrap break-all ${getSyntaxHighlight(line)}`}>
                    {searchQuery ? highlightMatches(line, searchQuery) : line || " "}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </ScrollArea>
    </div>
  );
}

function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-chart-4/30 text-foreground">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
