import { Router } from 'express';
import { redis } from '../services/redis';
import { VALID_PHASES } from '../middleware/validation';

const router = Router();

const ADMIN_KEY = process.env.ADMIN_KEY;

router.use((req, res, next) => {
  if (ADMIN_KEY && req.query.key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Invalid admin key' });
  }
  next();
});

router.get('/dashboard', async (req, res) => {
  const activeSessionIds = await redis.smembers('sessions:active');
  const now = Date.now();

  // Fetch all session timestamps in parallel (avoids N+1)
  const sessionTimestamps = await Promise.all(
    activeSessionIds.map(sid => redis.hget(`session:${sid}`, 'lastActive'))
  );
  let activeCount = 0;
  for (let i = 0; i < activeSessionIds.length; i++) {
    const lastActive = sessionTimestamps[i];
    if (!lastActive || now - parseInt(lastActive) > 300000) {
      await redis.srem('sessions:active', activeSessionIds[i]);
    } else {
      activeCount++;
    }
  }

  // Batch all independent metric reads
  const [
    totalUsers, totalMessages, totalCompletions,
    guardrailsTotal, guardrailsInput, guardrailsOutput,
    feedbackPositive, feedbackNegative,
  ] = await Promise.all([
    redis.get('metrics:users:total'),
    redis.get('metrics:messages:total'),
    redis.get('metrics:phases:total_completions'),
    redis.get('metrics:guardrails:total'),
    redis.get('metrics:guardrails:input'),
    redis.get('metrics:guardrails:output'),
    redis.get('metrics:feedback:positive'),
    redis.get('metrics:feedback:negative'),
  ]);

  // Phase metrics in parallel
  const [phaseCompletionValues, phaseMessageValues] = await Promise.all([
    Promise.all(VALID_PHASES.map(p => redis.get(`metrics:phase:${p}:completions`))),
    Promise.all(VALID_PHASES.map(p => redis.get(`metrics:messages:phase:${p}`))),
  ]);
  const phaseCompletions: Record<string, number> = {};
  const phaseMessages: Record<string, number> = {};
  VALID_PHASES.forEach((p, i) => {
    phaseCompletions[p] = parseInt(phaseCompletionValues[i] || '0');
    phaseMessages[p] = parseInt(phaseMessageValues[i] || '0');
  });

  // Latency stats
  const latencySamples = (await redis.lrange('metrics:latency:samples', 0, 199)).map(Number);
  const avgLatency = latencySamples.length > 0
    ? Math.round(latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length)
    : 0;
  const maxLatency = latencySamples.length > 0 ? Math.max(...latencySamples) : 0;

  // DAU for last 7 days in parallel
  const dauDates = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10)
  );
  const dauCounts = await Promise.all(dauDates.map(d => redis.scard(`metrics:dau:${d}`)));
  const dau = dauDates.map((date, i) => ({ date, count: dauCounts[i] }));

  res.json({
    kpis: {
      totalUsers: parseInt(totalUsers || '0'),
      activeSessions: activeCount,
      totalMessages: parseInt(totalMessages || '0'),
      totalCompletions: parseInt(totalCompletions || '0'),
      guardrailsTriggered: parseInt(guardrailsTotal || '0'),
      guardrailsInput: parseInt(guardrailsInput || '0'),
      guardrailsOutput: parseInt(guardrailsOutput || '0'),
      feedbackPositive: parseInt(feedbackPositive || '0'),
      feedbackNegative: parseInt(feedbackNegative || '0'),
    },
    phaseCompletions,
    phaseMessages,
    latency: { avg: avgLatency, max: maxLatency, samples: latencySamples.length },
    dau,
  });
});

router.get('/users', async (req, res) => {
  const activeSessionIds = await redis.smembers('sessions:active');
  const now = Date.now();

  // Fetch all session data in parallel (avoids N+1)
  const sessionDataList = await Promise.all(
    activeSessionIds.map(sid => redis.hgetall(`session:${sid}`))
  );

  const users = sessionDataList
    .map((data, i) => {
      if (!data?.lastActive) return null;
      const isActive = now - parseInt(data.lastActive) < 300000;
      if (!isActive) return null;
      return {
        sessionId: activeSessionIds[i].slice(0, 8) + '...',
        currentPhase: data.currentPhase || 'Ideation',
        messageCount: parseInt(data.messageCount || '0'),
        startedAt: parseInt(data.startedAt || '0'),
        lastActive: parseInt(data.lastActive || '0'),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.lastActive - a!.lastActive);

  res.json({ users, total: users.length });
});

router.get('/guardrails', async (req, res) => {
  const logs = (await redis.lrange('log:guardrails', 0, 49)).map(s => JSON.parse(s));
  res.json({ logs });
});

router.get('/activity', async (req, res) => {
  const [messages, completions] = await Promise.all([
    redis.lrange('log:messages', 0, 49).then(list => list.map(s => JSON.parse(s))),
    redis.lrange('log:completions', 0, 29).then(list => list.map(s => JSON.parse(s))),
  ]);
  res.json({ messages, completions });
});

router.get('/feedback', async (req, res) => {
  // Batch all reads in parallel
  const feedbackKeys = VALID_PHASES.flatMap(p => [
    `metrics:feedback:phase:${p}:positive`,
    `metrics:feedback:phase:${p}:negative`,
  ]);

  const [totalFeedback, positive, negative, ...phaseValues] = await Promise.all([
    redis.get('metrics:feedback:total'),
    redis.get('metrics:feedback:positive'),
    redis.get('metrics:feedback:negative'),
    ...feedbackKeys.map(k => redis.get(k)),
  ]);

  const byPhase: Record<string, { positive: number; negative: number }> = {};
  VALID_PHASES.forEach((p, i) => {
    byPhase[p] = {
      positive: parseInt(phaseValues[i * 2] || '0'),
      negative: parseInt(phaseValues[i * 2 + 1] || '0'),
    };
  });

  const logs = (await redis.lrange('log:feedback', 0, 49)).map(s => JSON.parse(s));

  res.json({
    total: parseInt(totalFeedback || '0'),
    positive: parseInt(positive || '0'),
    negative: parseInt(negative || '0'),
    byPhase,
    logs,
  });
});

export default router;
