import { prisma } from "../../../config/prisma";
import { EventQueryService } from "./EventQueryService";
import { EventManagementService } from "./EventManagementService";
import { EventStatsService } from "./EventStatsService";
import { OrganizerProfileService } from "./OrganizerProfileService";

export const organizerProfileService = new OrganizerProfileService(prisma);
export const eventQueryService = new EventQueryService(prisma, organizerProfileService);
export const eventManagementService = new EventManagementService(prisma);
export const eventStatsService = new EventStatsService(prisma);

export { EventQueryService, EventManagementService, EventStatsService, OrganizerProfileService };
