import { prisma } from "../../../config/prisma";
import { TransactionCreationService } from "./TransactionCreationService";
import { TransactionStatusService } from "./TransactionStatusService";
import { TransactionQueryService } from "./TransactionQueryService";

export const transactionCreationService = new TransactionCreationService(prisma);
export const transactionStatusService = new TransactionStatusService(prisma);
export const transactionQueryService = new TransactionQueryService(prisma);

export { TransactionCreationService, TransactionStatusService, TransactionQueryService };
