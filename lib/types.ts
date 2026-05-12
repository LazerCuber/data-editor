export interface DataRow {
  _index: number;
  [key: string]: unknown;
}

export type FileType = 'json' | 'jsonl' | 'csv' | 'parquet';

export interface DatasetState {
  rows: DataRow[];
  columns: string[];
  fileName: string;
  fileType: FileType;
  totalRows: number;
  modifiedRows: Set<number>;
  rawContent?: string; // Store original content for raw view
}

export interface ColumnStats {
  name: string;
  type: string;
  minLength: number;
  maxLength: number;
  distribution: number[];
}
