export interface ExcelFile {
  id: string;
  name: string;
  sheets: { [sheetName: string]: any[][] };
  file: File;
}

export interface ColumnStats {
  average: number;
  sum: number;
  min: number;
  max: number;
  count: number;
}