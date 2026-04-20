import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    event: {
      async findFirst({ args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      async findUnique({ args, query }) {
        if (args.where && 'id' in args.where) {
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

export { prisma };
