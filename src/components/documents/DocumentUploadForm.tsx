"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadSchema, type UploadFormValues } from "@/lib/schemas/documents";
import { uploadDocument } from "@/lib/api/documents";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

interface DocumentUploadFormProps {
  onUploaded: () => void;
}

export function DocumentUploadForm({ onUploaded }: DocumentUploadFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({ resolver: zodResolver(uploadSchema) });

  async function onSubmit(values: UploadFormValues) {
    setFormError(null);
    try {
      await uploadDocument(values.file[0]);
      reset();
      onUploaded();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="application/pdf"
          {...register("file")}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading…" : "Upload"}
        </Button>
      </div>
      {errors.file && (
        <p className="text-sm text-destructive">{errors.file.message as string}</p>
      )}
      {formError && <p className="text-sm text-destructive">{formError}</p>}
    </form>
  );
}
