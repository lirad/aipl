import { Router } from 'express';
import { redis } from '../services/redis';
import {
  validate,
  TrackMessageSchema,
  TrackPhaseCompleteSchema,
  TrackGuardrailSchema,
  TrackLatencySchema,
  TrackFeedbackSchema,
} from '../middleware/validation';

const router = Router();

router.post('/message', validate(TrackMessageSchema), async (req, res) => {
  const { sessionId, phase, role, content } = req.body;

  await redis.incr('metrics:messages:total');
  await redis.incr(`metrics:messages:phase:${phase}`);
  await redis.hincrby(`session:${sessionId}`, 'messageCount', 1);

  // Store recent messages log with content preview (keep last 100)
  const preview = content ? content.slice(0, 200) : '';
  await redis.lpush('log:messages', JSON.stringify({
    sessionId: sessionId.slice(0, 8),
    phase,
    role,
    content: preview,
    timestamp: Date.now(),
  }));
  await redis.ltrim('log:messages', 0, 99);

  res.json({ ok: true });
});

router.post('/phase-complete', validate(TrackPhaseCompleteSchema), async (req, res) => {
  const { sessionId, phase } = req.body;

  await redis.incr(`metrics:phase:${phase}:completions`);
  await redis.incr('metrics:phases:total_completions');

  await redis.lpush('log:completions', JSON.stringify({
    sessionId: sessionId?.slice(0, 8),
    phase,
    timestamp: Date.now(),
  }));
  await redis.ltrim('log:completions', 0, 49);

  res.json({ ok: true });
});

router.post('/guardrail', validate(TrackGuardrailSchema), async (req, res) => {
  const { sessionId, type, layer, description, severity } = req.body;

  await redis.incr('metrics:guardrails:total');
  await redis.incr(`metrics:guardrails:${layer}`); // input or output

  await redis.lpush('log:guardrails', JSON.stringify({
    sessionId: sessionId?.slice(0, 8),
    type,
    layer,
    description,
    severity: severity || 'medium',
    timestamp: Date.now(),
  }));
  await redis.ltrim('log:guardrails', 0, 99);

  res.json({ ok: true });
});

router.post('/latency', validate(TrackLatencySchema), async (req, res) => {
  const { latencyMs } = req.body;

  // Store latency samples for avg calculation (keep last 200)
  await redis.lpush('metrics:latency:samples', latencyMs.toString());
  await redis.ltrim('metrics:latency:samples', 0, 199);

  res.json({ ok: true });
});

router.post('/feedback', validate(TrackFeedbackSchema), async (req, res) => {
  const { sessionId, phase, rating, messagePreview } = req.body;

  await redis.incr('metrics:feedback:total');
  await redis.incr(`metrics:feedback:${rating}`);
  await redis.incr(`metrics:feedback:phase:${phase}:${rating}`);

  await redis.lpush('log:feedback', JSON.stringify({
    sessionId: sessionId?.slice(0, 8),
    phase,
    rating,
    messagePreview: messagePreview ? messagePreview.slice(0, 200) : '',
    timestamp: Date.now(),
  }));
  await redis.ltrim('log:feedback', 0, 99);

  res.json({ ok: true });
});

export default router;
