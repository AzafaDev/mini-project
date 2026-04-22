import fs from "fs";

import cloudinary from "../config/cloudinary";

// Upload file ke Cloudinary dan hapus file temporary setelahnya
export const uploadToCloudinary = async (filePath: string, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    // Hapus file temporary dari server setelah berhasil upload
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error:any) {
    // Selalu hapus file temporary meskipun upload gagal
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};
