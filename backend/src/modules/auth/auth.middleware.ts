import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "./auth.type";
import { prisma } from "../../config/prisma";

export const authMiddleware = {
  // Middleware untuk verifikasi token sementara pada saat verifikasi email
  // Hanya untuk user yang belum terverifikasi
  verifyTempToken: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Ambil token dari cookie
      const token = req.cookies.temp_token;
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No token provided" });
      }

      // Verifikasi signature dan expiry token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        userEmail: string;
      };

      // Cek status verifikasi user di database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { isVerified: true },
      });

      // Jika user sudah terverifikasi, token ini tidak berlaku lagi
      if (user?.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Account already verified. Please login.",
        });
      }

      // Simpan userId ke request object untuk digunakan di controller
      req.userId = decoded.userId;

      next();
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  },

  // Middleware utama untuk proteksi route yang butuh login
  // Ini yang digunakan di hampir semua route aplikasi
  verifyAuthToken: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Ambil token auth dari cookie
      const token = req.cookies.auth_token;

      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No token provided" });
      }

      // Verifikasi dan decode token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        userRole: string;
      };

      // Pastikan user masih ada di database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isVerified: true },
      });

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid token" });
      }

      // Attach data user ke request object
      req.userId = decoded.userId;
      req.userRole = decoded.userRole;

      next();
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  },

  // Middleware untuk cek apakah user punya role ORGANIZER
  // HARUS dipakai SETELAH verifyAuthToken karena butuh userRole
  isOrganizer: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.userRole;
      if (!userRole) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      // Hanya user dengan role ORGANIZER yang boleh akses route ini
      if (userRole !== "ORGANIZER") {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
      next();
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  },
};