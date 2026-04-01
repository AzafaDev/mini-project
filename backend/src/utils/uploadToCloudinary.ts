import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
}

/**
 * Upload file buffer to Cloudinary
 * @param fileBuffer - Buffer of the file to upload
 * @param folder - Folder name in Cloudinary
 * @param resourceType - Type of resource: "image", "raw", or "auto"
 * @returns Upload result with secure_url, public_id, and format
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  resourceType: "image" | "raw" | "auto" = "image",
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `minpro/${folder}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        if (!result) {
          reject(new Error("Cloudinary upload failed: No result returned"));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
        });
      },
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
}

/**
 * Delete file from Cloudinary by public_id
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" | "auto" = "image",
): Promise<{ result: string }> {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}
