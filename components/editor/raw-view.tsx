"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Copy, Check, FileCode, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FileType } from "@/lib/types";

interface RawViewProps {
  content: string;
  fileType: FileType;
  fileName: string;
}

const MAX_LINE_DISPLAY_LENGTH = 500; // Truncate very long lines for performance

export function RawView({ content, fileType, fileName }: RawViewProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => content.split("\n"), [content]);
  const isLargeFile = lines.length > 10000;

  const filteredLines = useMemo(() => {
    if (!searchQuery.trim()) return lines.map((line, i) => ({ line, index: i }));
    const query = searchQuery.toLowerCase();
    return lines
      .map((line, i) => ({ line, index: i }))
      .filter(({ line }) => line.toLowerCase().includes(query));
  }, [lines, searchQuery]);

  const rowVirtualizer = useVirtualizer({
    count: filteredLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 20,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateLine = useCallback((line: string): { text: string; truncated: boolean } => {
    if (line.length <= MAX_LINE_DISPLAY_LENGTH) {
      return { text: line, truncated: false };
    }
    return { text: line.slice(0, MAX_LINE_DISPLAY_LENGTH), truncated: true };
  }, []);

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
          {isLargeFile && (
            <span className="flex items-center gap-1 rounded bg-chart-5/20 px-2 py-0.5 text-xs text-chart-5">
              <AlertTriangle className="h-3 w-3" />
              Large file - virtualized
            </span>
          )}
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
            {filteredLines.length.toLocaleString()} matching lines
          </p>
        )}
      </div>

      {/* Virtualized Content */}
      <div ref={parentRef} className="flex-1 overflow-auto bg-background p-4">
        <pre className="font-mono text-sm">
          <code>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const { line, index } = filteredLines[virtualRow.index];
                const { text, truncated } = truncateLine(line);
                
                return (
                  <div
                    key={virtualRow.index}
                    className="absolute left-0 top-0 flex w-full hover:bg-secondary/30"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <span className="mr-4 w-14 shrink-0 select-none text-right text-muted-foreground/50">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-foreground">
                      {searchQuery ? highlightMatches(text, searchQuery) : text || " "}
                      {truncated && (
                        <span className="text-muted-foreground/50">... ({line.length.toLocaleString()} chars)</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </code>
        </pre>
      </div>
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
