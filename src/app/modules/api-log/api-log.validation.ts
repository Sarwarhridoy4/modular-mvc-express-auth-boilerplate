import { z } from "zod";

export const getErrorLogsSchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  statusCode: z.string().optional().transform(Number),
  method: z.string().optional(),
  url: z.string().optional(),
  ip: z.string().optional(),
  error: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sort: z.string().optional(),
});

export type GetErrorLogsInput = z.infer<typeof getErrorLogsSchema>;