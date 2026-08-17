"use client";

import { useCallback, useEffect, useState } from "react";
import { listDocuments } from "@/lib/api/documents";
import type { DocumentItem } from "@/lib/types/document";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { DocumentList } from "@/components/documents/DocumentList";

const POLL_INTERVAL_MS = 4000;

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      setError(null);
    } catch {
      setError("Couldn't load documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === "PROCESSING");
    if (!hasProcessing) return;
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [documents, refresh]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">Upload PDFs for the assistant to index.</p>
      </div>
      <DocumentUploadForm onUploaded={refresh} />
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <DocumentList documents={documents} isLoading={isLoading} onDeleted={refresh} />
      )}
    </div>
  );
}
