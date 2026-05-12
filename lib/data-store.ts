import type { DataRow, DatasetState, ColumnStats, FileType } from './types';
import Papa from 'papaparse';

export function parseJSONL(content: string): DataRow[] {
  const lines = content.split('\n').filter(line => line.trim());
  const rows: DataRow[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    try {
      const parsed = JSON.parse(lines[i]);
      rows.push({ _index: i, ...parsed });
    } catch {
      console.warn(`Skipping invalid JSON at line ${i + 1}`);
    }
  }
  
  return rows;
}

export function parseJSON(content: string): DataRow[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => ({ _index: index, ...item }));
    }
    return [{ _index: 0, ...parsed }];
  } catch {
    throw new Error('Invalid JSON format');
  }
}

export function parseCSV(content: string): DataRow[] {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (result.errors.length > 0) {
    console.warn('CSV parse warnings:', result.errors);
  }

  return result.data.map((item, index) => ({
    _index: index,
    ...(item as Record<string, unknown>),
  }));
}

export async function parseParquet(buffer: ArrayBuffer): Promise<DataRow[]> {
  // Dynamic import for parquet-wasm to avoid SSR issues
  const { readParquet } = await import('parquet-wasm');
  const uint8Array = new Uint8Array(buffer);
  const arrowTable = readParquet(uint8Array);
  
  // Convert Arrow table to JSON-like format
  const rows: DataRow[] = [];
  const schema = arrowTable.schema;
  const fields = schema.fields;
  const numRows = arrowTable.numRows;
  
  for (let i = 0; i < numRows; i++) {
    const row: DataRow = { _index: i };
    for (let j = 0; j < fields.length; j++) {
      const field = fields[j];
      const column = arrowTable.getChildAt(j);
      if (column) {
        row[field.name] = column.get(i);
      }
    }
    rows.push(row);
  }
  
  return rows;
}

export function exportToJSONL(rows: DataRow[]): string {
  return rows.map(row => {
    const { _index, ...rest } = row;
    return JSON.stringify(rest);
  }).join('\n');
}

export function exportToJSON(rows: DataRow[]): string {
  const cleaned = rows.map(row => {
    const { _index, ...rest } = row;
    return rest;
  });
  return JSON.stringify(cleaned, null, 2);
}

export function exportToCSV(rows: DataRow[]): string {
  const cleaned = rows.map(row => {
    const { _index, ...rest } = row;
    return rest;
  });
  return Papa.unparse(cleaned);
}

export function generateRawContent(rows: DataRow[], fileType: FileType): string {
  switch (fileType) {
    case 'jsonl':
      return exportToJSONL(rows);
    case 'json':
      return exportToJSON(rows);
    case 'csv':
      return exportToCSV(rows);
    case 'parquet':
      return '[Parquet files are binary format - raw view shows parsed data as JSON]\n' + 
        JSON.stringify(rows.slice(0, 100).map(r => {
          const { _index, ...rest } = r;
          return rest;
        }), null, 2);
    default:
      return '';
  }
}

export function getColumns(rows: DataRow[]): string[] {
  const columnSet = new Set<string>();
  for (const row of rows.slice(0, 1000)) {
    for (const key of Object.keys(row)) {
      if (key !== '_index') {
        columnSet.add(key);
      }
    }
  }
  return Array.from(columnSet);
}

export function getColumnStats(rows: DataRow[], column: string): ColumnStats {
  const values = rows.map(row => row[column]);
  const lengths: number[] = [];
  let type = 'unknown';
  
  for (const val of values) {
    if (val === null || val === undefined) continue;
    
    if (typeof val === 'string') {
      type = 'string';
      lengths.push(val.length);
    } else if (typeof val === 'number') {
      type = 'number';
      lengths.push(val);
    } else if (typeof val === 'object') {
      type = 'object';
      lengths.push(JSON.stringify(val).length);
    }
  }
  
  const minLength = lengths.length > 0 ? Math.min(...lengths) : 0;
  const maxLength = lengths.length > 0 ? Math.max(...lengths) : 0;
  
  // Create distribution buckets (10 buckets)
  const distribution = new Array(10).fill(0);
  if (lengths.length > 0 && maxLength > minLength) {
    const bucketSize = (maxLength - minLength) / 10;
    for (const len of lengths) {
      const bucket = Math.min(9, Math.floor((len - minLength) / bucketSize));
      distribution[bucket]++;
    }
  } else if (lengths.length > 0) {
    distribution[0] = lengths.length;
  }
  
  return {
    name: column,
    type,
    minLength,
    maxLength,
    distribution,
  };
}

export function createInitialState(): DatasetState {
  return {
    rows: [],
    columns: [],
    fileName: '',
    fileType: 'jsonl',
    totalRows: 0,
    modifiedRows: new Set(),
  };
}
