export interface DataRow {
  _index: number;
  [key: string]: unknown;
}

export interface DatasetState {
  rows: DataRow[];
  columns: string[];
  fileName: string;
  fileType: 'json' | 'jsonl';
  totalRows: number;
  modifiedRows: Set<number>;
}

export interface ColumnStats {
  name: string;
  type: string;
  minLength: number;
  maxLength: number;
  distribution: number[];
}
