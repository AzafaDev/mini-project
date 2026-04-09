import fs from "fs";

import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = async (filePath: string, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    // HAPUS FILE SETELAH BERHASIL
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    // HAPUS FILE MESKIPUN GAGAL
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error("Failed to upload file to Cloudinary");
  }
};
