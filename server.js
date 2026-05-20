import express from 'express';
import { createHash, randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const CHAT_MODEL = process.env.CHAT_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
const CV_MODEL = process.env.CV_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// Session store: token -> expiry ms
const sessions = new Map();

// ── Candidate context ──────────────────────────────────────────────────────
const CANDIDATE_CONTEXT = `
RICHARD AWE — AI ARCHITECT & FULL-STACK ENGINEER
Contact: richard3d7@gmail.com | Richard.Awe@3d7tech.com | github.com/richardawe
Founder, 3d7 Technologies

PROFESSIONAL IDENTITY:
Richard designs, builds, and deploys AI-powered systems across legal-tech, political intelligence, energy trading, browser-native ML, humanitarian response, edtech, and media. His signature approach: hybrid deterministic/LLM architectures — code handles correctness-critical decisions; AI handles language, extraction, and generation. Every project ships with GitHub Actions pipelines, not just working demos.

CORE SKILLS:
- Multi-Agent AI Architecture, GitHub Actions Orchestration, RAG Pipelines
- LLM Integration: OpenAI GPT-4, Claude (Anthropic), OpenRouter, LangChain
- Transformers.js / Browser-Native ML, Vector Databases (ChromaDB, Pinecone)
- Event-Driven State Machines, Jamstack AI Data Products, Prompt Engineering
- Languages: Python 3.12, TypeScript, JavaScript, PHP 8.4
- Frontend: React, Next.js, Vue.js, Alpine.js, Tailwind CSS, Bootstrap 5
- Backend: Node.js/Express, Flask, Django, Laravel 13
- Databases: MySQL 8.0, PostgreSQL, SQLite, ChromaDB, Pinecone
- DevOps: GitHub Actions CI/CD, Vercel, cPanel/FTP, GitHub Pages, OIDC
- Other: libsodium, JWT, Playwright, Tesseract OCR, Gmail API, OAuth 2.0, Remotion, MediaRecorder API, Web Workers API

FEATURED PROJECTS (2025–2026):

1. EU261 Auto-Claim Agent (Legal-Tech · Agentic) — Phase 1 Live
Role: Lead AI Architect & Developer | github.com/richardawe/Eu261
Agentic system that autonomously files EU261/2004 flight compensation claims: intake, eligibility, demand letter generation, airline submission, and National Enforcement Body escalation — all orchestrated via GitHub Actions.
Key architecture: GitHub Actions as distributed state machine (11 event-driven workflows on Issue label transitions, no external queue or DB needed). Hybrid AI/rules: deterministic Python rules engine (eligibility.py) decides legal eligibility; LLM (extractor.py) only handles structured fact extraction from free text — never legal decisions. libsodium PII encryption, JWT consent tokens, pluggable per-airline adapters with Playwright/SMTP/HTTP runtimes.
Stack: Python 3.12, GitHub Actions (11 workflows), YAML rules engine, libsodium, JWT, Playwright, pytest

2. UK Politics AI Positioning Matrix (Political Intelligence · Cron Pipeline) — Live, 6-hourly updates
Role: Lead AI Architect & Developer
Live dashboard monitoring UK news and mapping party ideological positions on a dynamic 2×2 political compass (left/right × authoritarian/libertarian). Autonomously updates every 6 hours via GitHub Actions.
Key architecture: Multi-provider AI abstraction (lib/ai/index.ts resolves to OpenRouter/OpenAI/Anthropic at runtime — LLM swappable with zero code changes). Credibility-weighted signal scoring (SOURCE_WEIGHTS: official_speech=1.0 to social_media=0.2). Baseline anchoring to 2024 manifesto; REVERSION_RATE=0.05 prevents drift. Fully static Next.js/GitHub Pages output, zero hosting cost.
Stack: Next.js (App Router), TypeScript, React, Recharts, Tailwind CSS, OpenRouter/OpenAI/Anthropic adapters, GitHub Pages

3. EV Showcase — Electric Vehicles of the World (Jamstack AI · Daily Pipeline) — Live, daily updates
Role: Lead Developer | github.com/richardawe/Electric-vehicles
Comprehensive searchable EV database growing autonomously: daily GitHub Actions cron adds newly confirmed models via LLM, with three-tier Wikipedia/Wikimedia image pipeline and schema validation before every commit.
Stack: Python 3.12, OpenRouter, Wikipedia/Wikimedia APIs, GitHub Actions (daily cron), Static HTML/CSS/JS, GitHub Pages

4. Brand Reel — Webpage to Brand Video (Browser-Native · Video Generation) — Live
Role: Lead Developer | richardawe.github.io/agents
Generates polished 10-second brand videos entirely client-side from any webpage — no server, no upload, no API key. Remotion for in-browser preview; Canvas 2D + MediaRecorder for downloadable WebM.
Stack: React, TypeScript, Vite, Remotion, Canvas 2D API, MediaRecorder API (VP9), Tailwind CSS, GitHub Pages

5. BrowserML — Client-Side AI Task Runner (Browser-Native ML · Zero Server) — Live
Role: Lead Developer | github.com/richardawe/3dpages
Text summarisation, creative writing, extractive Q&A, and multi-language translation running 100% client-side via Transformers.js + Web Workers. No server, no API key, no data egress.
Stack: Vanilla JavaScript, Transformers.js v2.17.2, Web Workers API, GitHub Pages

6. EnergyTRM — Energy Trading & Risk Management (Full CI/CD) — In Production at energytrm.com
Role: Lead Developer | github.com/richardawe/energytrm
Full ETRM training portal: deal capture, validation, logistics, invoicing, settlement, VaR/stress testing across 7 phases. Two-stage GitHub Actions CI/CD (MySQL 8.0 service container for tests; FTP deploy to cPanel on main).
Stack: Laravel 13, PHP 8.4, MySQL 8.0, Alpine.js, Bootstrap 5, Vite, GitHub Actions (CI + FTP deploy), cPanel

EARLIER PROJECTS:
- AI Metrics Intelligence Platform: Enterprise AI maturity diagnostic — questionnaire profiling, data gap analysis, real-time analytics cockpit. React, Python/Flask, LLM orchestration, SQL + vector storage.
- AI Agent Workflow System: 5-step multi-agent pipeline (Plan→Research→Execute→QA→Refine), model-agnostic via OpenRouter, Flask web UI + CLI. github.com/richardawe/testing-agents
- Intelligent Email Assistant: Gmail OAuth 2.0, RAG pipeline with ChromaDB, AI composition, human-in-the-loop approval before sending. Python, Flask, OpenRouter, Gmail API, ChromaDB.
- DataRadar — Document Intelligence: Auto-routes uploads to SQL or vector DB; supports Excel, PDF, OCR, Word, plain text with natural language querying. Python, Node.js, Tesseract OCR, ChromaDB, PostgreSQL.
- Humanitarian Intelligence Platform Nigeria: Real-time crisis intelligence, state-level vulnerability indicators, AI-driven aid allocation, live geospatial dashboards. Node.js, React, REST APIs.
- Kidemia — AI Learning Platform: Adaptive education for children with personalised tests and progress tracking. React, Node.js, AI personalisation engine.
- RegAlertPro — Regulatory Compliance SaaS: Federal Register pipeline, LLM relevance scoring, automated email alerting, $499/month subscription tier. Laravel, React.
- DocumentHelp.ai: AI business document generator (co-developer), live on Vercel. React/Vite, Node.js, OpenAI API.

PROFESSIONAL BACKGROUND (Enterprise 2015–Present):
- Mar 2025 – Present: Lead Business Analyst, Fitch Ratings
- Apr 2024 – Mar 2025: Product Owner, 3D7 Technologies
- Feb 2023 – Apr 2024: Lead Business Analyst, RAC Limited
- Jan 2022 – Jan 2023: Lead Business Analyst, HMRC
- Aug 2020 – Dec 2021: Lead Business Analyst, European Central Bank
- Apr 2019 – Feb 2020: Lead Business Analyst, Lloyds Banking Group
- Oct 2015 – Apr 2019: Senior Business Analyst, HSBC
`;

const CHAT_SYSTEM_PROMPT = `You are the AI assistant on Richard Awe's portfolio website. Your job is to enthusiastically and accurately answer visitor questions about Richard — his skills, projects, background, and what makes him an exceptional AI Architect and Full-Stack Engineer.

Be warm, specific, and professional. Reference concrete project names and architectural decisions when relevant. Keep responses to 2–4 paragraphs unless the visitor asks for detail. Never fabricate information not provided below.

If someone asks about availability or wants to work with Richard, direct them to richard3d7@gmail.com.

If asked to do anything unrelated to Richard (write code, summarise articles, etc.), politely redirect to questions about Richard.

${CANDIDATE_CONTEXT}`;

const CV_SYSTEM_PROMPT = `You are a professional CV writer. Generate a tailored, compelling CV for Richard Awe based on a specific job description.

INSTRUCTIONS:
- Read the job description carefully and identify key requirements and keywords
- Write a 3–4 sentence professional summary targeting this specific role
- Select the 3–5 most relevant projects from Richard's portfolio
- List skills grouped by category, in order of relevance to the role
- Include the full professional experience timeline
- Use strong action verbs; mirror keywords from the job description naturally
- Format in clean markdown: ## for section headers, **bold** for company/role names, - for bullets
- Length: 700–1000 words total
- Only include Richard's real skills and experience — never fabricate anything

${CANDIDATE_CONTEXT}`;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }));
app.use(express.static(__dirname));

// Simple in-memory rate limiter
const rateBuckets = new Map();
function rateLimit(ip, max = 30, windowMs = 60_000) {
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.reset) {
    bucket = { count: 0, reset: now + windowMs };
  }
  bucket.count++;
  rateBuckets.set(ip, bucket);
  return bucket.count <= max;
}

// ── OpenRouter streaming helper ───────────────────────────────────────────
async function streamFromOpenRouter(model, messages, res, { maxTokens = 600, temperature = 0.7 } = {}) {
  if (!OPENROUTER_API_KEY) {
    res.write('data: {"error":"OPENROUTER_API_KEY is not configured on this server."}\n\n');
    res.end();
    return;
  }

  let apiRes;
  try {
    apiRes = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://richardawe.github.io/ai-architect-cv',
        'X-Title': 'Richard Awe CV',
      },
      body: JSON.stringify({ model, messages, stream: true, max_tokens: maxTokens, temperature }),
    });
  } catch (err) {
    console.error('OpenRouter fetch error:', err.message);
    res.write('data: {"error":"Could not reach AI service. Please try again."}\n\n');
    res.end();
    return;
  }

  if (!apiRes.ok) {
    const text = await apiRes.text().catch(() => '');
    console.error('OpenRouter error', apiRes.status, text);
    res.write(`data: {"error":"AI service error (${apiRes.status}). Please try again."}\n\n`);
    res.end();
    return;
  }

  const reader = apiRes.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } catch (err) {
    console.error('Stream error:', err.message);
  } finally {
    reader.releaseLock();
    res.end();
  }
}

function sseHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
}

// ── POST /api/chat ────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const ip = req.ip || 'unknown';
  if (!rateLimit(ip, 30, 60_000)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment.' });
  }

  const { message, history = [] } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const safeHistory = (Array.isArray(history) ? history : [])
    .slice(-8)
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));

  const messages = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
    ...safeHistory,
    { role: 'user', content: message.slice(0, 500) },
  ];

  sseHeaders(res);
  await streamFromOpenRouter(CHAT_MODEL, messages, res, { maxTokens: 600, temperature: 0.7 });
});

// ── POST /api/admin/auth ──────────────────────────────────────────────────
app.post('/api/admin/auth', (req, res) => {
  const { password } = req.body;
  if (!password || !ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  // Constant-time comparison via SHA-256
  const inputHash = createHash('sha256').update(String(password)).digest('hex');
  const storedHash = createHash('sha256').update(ADMIN_PASSWORD).digest('hex');
  if (inputHash !== storedHash) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  const token = randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + 4 * 3_600_000); // 4-hour session
  res.json({ ok: true, token });
});

// ── POST /api/admin/logout ────────────────────────────────────────────────
app.post('/api/admin/logout', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token) sessions.delete(token);
  res.json({ ok: true });
});

function verifyAdmin(req) {
  const token = req.headers['x-admin-token'];
  if (!token) return false;
  const expiry = sessions.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) { sessions.delete(token); return false; }
  return true;
}

// ── POST /api/generate-cv ─────────────────────────────────────────────────
app.post('/api/generate-cv', async (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { jobDescription } = req.body;
  if (!jobDescription || typeof jobDescription !== 'string') {
    return res.status(400).json({ error: 'jobDescription is required' });
  }

  const messages = [
    { role: 'system', content: CV_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Generate a tailored CV for the following job description:\n\n${jobDescription.slice(0, 5000)}`,
    },
  ];

  sseHeaders(res);
  await streamFromOpenRouter(CV_MODEL, messages, res, { maxTokens: 1500, temperature: 0.4 });
});

// ── /admin route ──────────────────────────────────────────────────────────
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  if (!OPENROUTER_API_KEY) console.warn('⚠  OPENROUTER_API_KEY not set');
  if (!ADMIN_PASSWORD) console.warn('⚠  ADMIN_PASSWORD not set');
});
