import { z } from "zod";

export const EventCategory = z.enum(["trips", "payments", "engagement", "users"]);

export const CreateEventSchema = z.object({
  name: z.string().min(1, "name is required"),
  category: EventCategory,
  route: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const GetEventsSchema = z.object({
  category: z.string().optional(),
  route: z.string().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().positive().max(10000).default(100),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type GetEventsInput = z.infer<typeof GetEventsSchema>;
