import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const basePrisma = new PrismaClient({ adapter });
const extendedPrisma = basePrisma.$extends({
  query: {
    event: {
      async findFirst({ args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      async findUnique({ args, query }) {
        if (args.where && "id" in args.where) {
          args.where = { ...args.where, isDeleted: false };
        }
        return query(args);
      },
      async findMany({ args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      async count({ args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      async update({ args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      async delete({ args, query }) {
        return query({
          ...args,
          data: { isDeleted: true, deletedAt: new Date() },
        });
      },
    },
  },
});

type PrismaTransactionClient = Parameters<Parameters<typeof extendedPrisma.$transaction>[0]>[0];

export type PrismaClientType = typeof extendedPrisma;
export type TxClient = PrismaTransactionClient;

export const prisma: PrismaClientType = extendedPrisma;
