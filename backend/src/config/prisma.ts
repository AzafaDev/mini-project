import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// Inisialisasi Prisma Client dengan Driver Adapter PostgreSQL (Prisma v7)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    event: {
      // Otomatis filter event yang sudah dihapus pada findFirst
      async findFirst({ args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      // Otomatis filter event yang sudah dihapus pada findUnique
      async findUnique({ args, query }) {
        if (args.where && "id" in args.where) {
          args.where = { ...args.where, isDeleted: false };
        }
        return query(args);
      },
      // Otomatis filter event yang sudah dihapus pada findMany
      async findMany({ args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      // Otomatis filter event yang sudah dihapus pada count
      async count({ args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      // Hanya bisa mengupdate event yang belum dihapus
      async update({ args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      // Override method delete menjadi soft delete
      // Data tidak pernah dihapus permanen dari database
      async delete({ args, query }) {
        return query({
          ...args,
          data: { isDeleted: true, deletedAt: new Date() },
        });
      },
    },
  },
});

export { prisma };
