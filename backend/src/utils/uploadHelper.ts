import { UploadedFile } from "express-fileupload";
import { handleFileUpload } from "./handleFileUpload";

// Helper untuk upload file dan return URL file
// Jika tidak ada file, return undefined tanpa error
export const getUploadUrl = async (
  file: UploadedFile | undefined,
  folder: string
): Promise<string | undefined> => {
  if (!file) return undefined;
  return await handleFileUpload(file, { folder });
};