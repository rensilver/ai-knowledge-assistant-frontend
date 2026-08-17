"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { deleteDocument } from "@/lib/api/documents";
import { ApiError } from "@/lib/api/client";
import type { DocumentItem } from "@/lib/types/document";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DocumentListItemProps {
  document: DocumentItem;
  onDeleted: () => void;
}

const STATUS_STYLES: Record<DocumentItem["status"], string> = {
  PROCESSING: "text-muted-foreground",
  COMPLETED: "text-primary",
  FAILED: "text-destructive",
};

const STATUS_DOT: Record<DocumentItem["status"], string> = {
  PROCESSING: "bg-muted-foreground motion-safe:animate-pulse",
  COMPLETED: "bg-primary",
  FAILED: "bg-destructive",
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentListItem({ document, onDeleted }: DocumentListItemProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteDocument(document.id);
      setOpen(false);
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex flex-col gap-1">
        <span className="font-medium">{document.filename}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {formatSize(document.sizeBytes)} · {document.uploadedBy}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center gap-1.5 font-mono text-xs uppercase ${STATUS_STYLES[document.status]}`}
        >
          <span className={`size-1.5 rounded-full ${STATUS_DOT[document.status]}`} />
          {document.status}
        </span>
        {user?.role === "ADMIN" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="ghost" size="sm" />}>
              Delete
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {document.filename}?</DialogTitle>
                <DialogDescription>This can&apos;t be undone.</DialogDescription>
              </DialogHeader>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting…" : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </li>
  );
}
