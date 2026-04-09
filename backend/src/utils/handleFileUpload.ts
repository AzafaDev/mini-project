import { UploadedFile } from "express-fileupload";
import { uploadToCloudinary } from "./uploadToCloudinary";
import { AppError } from "./AppError";

export interface UploadOptions {
  folder: string;
  allowedTypes?: string[];
  maxSize?: number;
}

const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const DEFAULT_MAX_SIZE = 25 * 1024 * 1024;
export const handleFileUpload = async (
  file: UploadedFile,
  options: UploadOptions,
): Promise<string> => {
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;
  const maxSize = options.maxSize || DEFAULT_MAX_SIZE;

  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError(
      `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
      400,
    );
  }

  if (file.size > maxSize) {
    throw new AppError(
      `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      400,
    );
  }

  const imageUrl = await uploadToCloudinary(file.tempFilePath, options.folder);
  return imageUrl;
};
