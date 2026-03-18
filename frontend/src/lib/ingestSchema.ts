import { z } from "zod";

const MetricsSchema = z
  .record(z.string(), z.union([z.number(), z.string(), z.boolean(), z.null(), z.any()]))
  .optional();

export const IngestRunSchema = z.object({
  run_id: z.string().min(1),
  timestamp: z.string().datetime().optional(),

  project: z.object({
    repo_url: z.string().url(),
    prod_url: z.string().url().optional(),
    uat_url: z.string().url().optional(),
    name: z.string().min(1).optional(),
  }),

  status: z.string().min(1),

  started_at: z.string().datetime().optional(),
  finished_at: z.string().datetime().optional(),

  before_metrics: MetricsSchema,
  after_metrics: MetricsSchema,

  issues: z
    .array(
      z.object({
        type: z.string().min(1),
        severity: z.string().min(1),
        file_path: z.string().min(1).optional(),
        rule_id: z.string().min(1).optional(),
        message: z.string().min(1).optional(),
      })
    )
    .default([]),

  prs: z
    .array(
      z.object({
        pr_url: z.string().url(),
        status: z.string().min(1),
        repo: z.string().min(1).optional(),
      })
    )
    .default([]),
});

export type IngestRunPayload = z.infer<typeof IngestRunSchema>;

