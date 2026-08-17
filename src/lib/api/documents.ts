import { apiFetch } from "@/lib/api/client";
import type { DocumentItem } from "@/lib/types/document";

export function uploadDocument(file: File): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<DocumentItem>("/documents/upload", {
    method: "POST",
    body: formData,
  });
}

export function listDocuments(): Promise<DocumentItem[]> {
  return apiFetch<DocumentItem[]>("/documents");
}

export function getDocument(id: string): Promise<DocumentItem> {
  return apiFetch<DocumentItem>(`/documents/${id}`);
}

export function deleteDocument(id: string): Promise<void> {
  return apiFetch<void>(`/documents/${id}`, { method: "DELETE" });
}
