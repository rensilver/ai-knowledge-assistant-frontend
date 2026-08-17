import type { DocumentItem } from "@/lib/types/document";
import { DocumentListItem } from "@/components/documents/DocumentListItem";

interface DocumentListProps {
  documents: DocumentItem[];
  isLoading: boolean;
  onDeleted: () => void;
}

export function DocumentList({ documents, isLoading, onDeleted }: DocumentListProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading documents…</p>;
  }

  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {documents.map((doc) => (
        <DocumentListItem key={doc.id} document={doc} onDeleted={onDeleted} />
      ))}
    </ul>
  );
}
