import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const uploadSchema = z.object({
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Please select a file")
    .refine((files) => files.length === 1, "Please select a file")
    .refine((files) => files[0]?.type === "application/pdf", "Only PDF files are supported")
    .refine((files) => files[0]?.size <= MAX_FILE_SIZE_BYTES, "File must be 20 MB or smaller"),
});

export type UploadFormValues = z.infer<typeof uploadSchema>;
