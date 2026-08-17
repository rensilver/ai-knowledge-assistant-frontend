export type DocumentStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface DocumentItem {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  status: DocumentStatus;
  uploadedBy: string;
  createdAt: string;
}
