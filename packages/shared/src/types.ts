import { z } from "zod";

export const idSchema = z.string().min(1);
export const correlationIdSchema = z.string().min(1);

export type Id = z.infer<typeof idSchema>;
export type CorrelationId = z.infer<typeof correlationIdSchema>;
