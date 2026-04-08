import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const VALID_PHASES = [
  'Ideation', 'Opportunity', 'Concept/Prototype',
  'Testing & Analysis', 'Roll-out', 'Monitoring',
] as const;

export const SessionStartSchema = z.object({
  sessionId: z.string().uuid(),
  userAgent: z.string().optional(),
});

export const HeartbeatSchema = z.object({
  sessionId: z.string().uuid(),
  currentPhase: z.enum(VALID_PHASES).optional(),
});

export const TrackMessageSchema = z.object({
  sessionId: z.string().uuid(),
  phase: z.enum(VALID_PHASES),
  role: z.enum(['user', 'model']),
  content: z.string().max(5000).optional(),
});

export const TrackPhaseCompleteSchema = z.object({
  sessionId: z.string().uuid(),
  phase: z.enum(VALID_PHASES),
});

export const TrackGuardrailSchema = z.object({
  sessionId: z.string().uuid(),
  type: z.string().max(100),
  layer: z.enum(['input', 'output']),
  description: z.string().max(1000),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const TrackLatencySchema = z.object({
  sessionId: z.string().uuid(),
  latencyMs: z.number().min(0).max(300000),
  phase: z.enum(VALID_PHASES),
});

export const TrackFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
  phase: z.enum(VALID_PHASES),
  rating: z.enum(['positive', 'negative']),
  messagePreview: z.string().max(500).optional(),
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
