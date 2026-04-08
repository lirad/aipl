import { Router } from 'express';
import { redis } from '../services/redis';

const router = Router();

const ADMIN_KEY = process.env.ADMIN_KEY;

router.use((req, res, next) => {
  if (ADMIN_KEY && req.query.key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Invalid admin key' });
  }
  next();
});

router.get('/dashboard', async (req, res) => {
  // Clean stale sessions (inactive for > 5 min)
  const activeSessionIds = await redis.smembers('sessions:active');
  const now = Date.now();
  let activeCount = 0;

  for (const sid of activeSessionIds) {
    const lastActive = await redis.hget(`session:${sid}`, 'lastActive');
    if (!lastActive || now - parseInt(lastActive) > 300000) {
      await redis.srem('sessions:active', sid);
    } else {
      activeCount++;
    }
  }

  const [
    totalUsers,
    totalMessages,
    totalCompletions,
    guardrailsTotal,
    guardrailsInput,
    guardrailsOutput,
  ] = await Promise.all([
    redis.get('metrics:users:total'),
    redis.get('metrics:messages:total'),
    redis.get('metrics:phases:total_completions'),
    redis.get('metrics:guardrails:total'),
    redis.get('metrics:guardrails:input'),
    redis.get('metrics:guardrails:output'),
  ]);

  // Phase completion counts
  const phases = ['Ideation', 'Opportunity', 'Concept/Prototype', 'Testing & Analysis', 'Roll-out', 'Monitoring'];
  const phaseCompletions: Record<string, number> = {};
  const phaseMessages: Record<string, number> = {};
  for (const p of phases) {
    phaseCompletions[p] = parseInt((await redis.get(`metrics:phase:${p}:completions`)) || '0');
    phaseMessages[p] = parseInt((await redis.get(`metrics:messages:phase:${p}`)) || '0');
  }

  // Latency stats
  const latencySamples = (await redis.lrange('metrics:latency:samples', 0, -1)).map(Number);
  const avgLatency = latencySamples.length > 0
    ? Math.round(latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length)
    : 0;
  const maxLatency = latencySamples.length > 0 ? Math.max(...latencySamples) : 0;

  // DAU for last 7 days
  const dau: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const count = await redis.scard(`metrics:dau:${d}`);
    dau.push({ date: d, count });
  }

  res.json({
    kpis: {
      totalUsers: parseInt(totalUsers || '0'),
      activeSessions: activeCount,
      totalMessages: parseInt(totalMessages || '0'),
      totalCompletions: parseInt(totalCompletions || '0'),
      guardrailsTriggered: parseInt(guardrailsTotal || '0'),
      guardrailsInput: parseInt(guardrailsInput || '0'),
      guardrailsOutput: parseInt(guardrailsOutput || '0'),
      feedbackPositive: parseInt((await redis.get('metrics:feedback:positive')) || '0'),
      feedbackNegative: parseInt((await redis.get('metrics:feedback:negative')) || '0'),
    },
    phaseCompletions,
    phaseMessages,
    latency: { avg: avgLatency, max: maxLatency, samples: latencySamples.length },
    dau,
  });
});

router.get('/users', async (req, res) => {
  const activeSessionIds = await redis.smembers('sessions:active');
  const users = [];

  for (const sid of activeSessionIds) {
    const data = await redis.hgetall(`session:${sid}`);
    if (data && data.lastActive) {
      const isActive = Date.now() - parseInt(data.lastActive) < 300000;
      if (isActive) {
        users.push({
          sessionId: sid.slice(0, 8) + '...',
          currentPhase: data.currentPhase || 'Ideation',
          messageCount: parseInt(data.messageCount || '0'),
          startedAt: parseInt(data.startedAt || '0'),
          lastActive: parseInt(data.lastActive || '0'),
        });
      }
    }
  }

  users.sort((a, b) => b.lastActive - a.lastActive);
  res.json({ users, total: users.length });
});

router.get('/guardrails', async (req, res) => {
  const logs = (await redis.lrange('log:guardrails', 0, 49)).map(s => JSON.parse(s));
  res.json({ logs });
});

router.get('/activity', async (req, res) => {
  const messages = (await redis.lrange('log:messages', 0, 49)).map(s => JSON.parse(s));
  const completions = (await redis.lrange('log:completions', 0, 29)).map(s => JSON.parse(s));
  res.json({ messages, completions });
});

router.get('/feedback', async (req, res) => {
  const [totalFeedback, positive, negative] = await Promise.all([
    redis.get('metrics:feedback:total'),
    redis.get('metrics:feedback:positive'),
    redis.get('metrics:feedback:negative'),
  ]);

  const phases = ['Ideation', 'Opportunity', 'Concept/Prototype', 'Testing & Analysis', 'Roll-out', 'Monitoring'];
  const byPhase: Record<string, { positive: number; negative: number }> = {};
  for (const p of phases) {
    byPhase[p] = {
      positive: parseInt((await redis.get(`metrics:feedback:phase:${p}:positive`)) || '0'),
      negative: parseInt((await redis.get(`metrics:feedback:phase:${p}:negative`)) || '0'),
    };
  }

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
