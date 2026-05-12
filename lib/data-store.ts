import type { DataRow, DatasetState, ColumnStats } from './types';

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
