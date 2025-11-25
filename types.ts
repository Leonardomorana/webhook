export interface ProcessedRow {
  id: string;
  timestamp: string;
  originalPayload: string; // Storing the raw JSON string
  data: Record<string, string | number | boolean | null>; // Flat structure for spreadsheet
}

export interface ProcessingStatus {
  isProcessing: boolean;
  error: string | null;
  successMessage: string | null;
}

export enum Tab {
  INPUT = 'INPUT',
  SHEET = 'SHEET',
  SETTINGS = 'SETTINGS'
}