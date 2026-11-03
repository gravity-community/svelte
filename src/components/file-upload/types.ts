export type FileUploadStatus = "idle" | "uploading" | "ok" | "invalid";

export type FileUploadFile = {
  name: string;
  status?: FileUploadStatus;
  /** 0-100, drawn as a bar while uploading. */
  progress?: number;
  /** Why the file was refused, shown while invalid. */
  reason?: string;
};
