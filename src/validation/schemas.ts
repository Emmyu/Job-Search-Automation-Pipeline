import { z } from "zod";

export const searchCriteriaSchema = z.object({
  keywords: z.array(z.string()).min(1).optional(),
  location: z.string().optional(),
  remoteOnly: z.boolean().optional(),
  minMatchScore: z.number().min(0).max(100).optional(),
  excludeCompanies: z.array(z.string()).optional(),
  titleMustInclude: z.array(z.string()).optional(),
});

export const createApplicationSchema = z.object({
  jobId: z.string().min(1),
  status: z
    .enum(["saved", "applied", "interview", "offer", "rejected", "withdrawn"])
    .optional(),
  notes: z.string().optional(),
});

export const updateApplicationSchema = z.object({
  status: z
    .enum(["saved", "applied", "interview", "offer", "rejected", "withdrawn"])
    .optional(),
  notes: z.string().optional(),
});
