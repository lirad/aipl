import { Router } from 'express';
import { redis } from '../services/redis';
import { validate, SessionStartSchema, HeartbeatSchema } from '../middleware/validation';

const router = Router();

router.post('/start', validate(SessionStartSchema), async (req, res) => {
  const { sessionId, userAgent } = req.body;

  const now = Date.now();
  const sessionKey = `session:${sessionId}`;

  const exists = await redis.exists(sessionKey);

  await redis.hmset(sessionKey, {
    sessionId,
    userAgent: userAgent || 'unknown',
    startedAt: exists ? (await redis.hget(sessionKey, 'startedAt')) || now : now,
    lastActive: now,
    currentPhase: 'Ideation',
    messageCount: exists ? (await redis.hget(sessionKey, 'messageCount')) || '0' : '0',
  });
  await redis.expire(sessionKey, 86400); // 24h TTL

  // Track active sessions set
  await redis.sadd('sessions:active', sessionId);

  // Increment total unique users only if new
  if (!exists) {
    await redis.incr('metrics:users:total');
  }

  // Track daily active
  const today = new Date().toISOString().slice(0, 10);
  await redis.sadd(`metrics:dau:${today}`, sessionId);
  await redis.expire(`metrics:dau:${today}`, 604800); // 7 days

  res.json({ ok: true, isNew: !exists });
});

router.post('/heartbeat', validate(HeartbeatSchema), async (req, res) => {
  const { sessionId, currentPhase } = req.body;

  const sessionKey = `session:${sessionId}`;
  await redis.hmset(sessionKey, {
    lastActive: Date.now(),
    ...(currentPhase && { currentPhase }),
  });
  await redis.expire(sessionKey, 86400);
  await redis.sadd('sessions:active', sessionId);

  res.json({ ok: true });
});

export default router;
