import { UploadedFile } from "express-fileupload";
import { handleFileUpload } from "./handleFileUpload";

export const getUploadUrl = async (
  file: UploadedFile | undefined,
  folder: string
): Promise<string | undefined> => {
  if (!file) return undefined;
  return await handleFileUpload(file, { folder });
};