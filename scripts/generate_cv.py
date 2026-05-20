#!/usr/bin/env python3
"""
Generate a tailored CV for Richard Awe from a job description.
Mirrors the EU261 engine/openrouter.py + scripts/run_draft.py pattern.

Env vars:
    OPENROUTER_API_KEY  required
    JOB_DESCRIPTION     required  (set by workflow_dispatch input)
    CV_MODEL            optional  (default: meta-llama/llama-3.3-70b-instruct:free)
"""
from __future__ import annotations

import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx

# ── OpenRouter client (mirrors EU261 engine/openrouter.py) ────────────────────
OPENROUTER_BASE = "https://openrouter.ai/api/v1"
_MAX_ATTEMPTS = 4
_RETRYABLE = {429, 500, 502, 503, 504}


class OpenRouterError(Exception):
    def __init__(self, status: int, body: str) -> None:
        self.status = status
        super().__init__(f"OpenRouter {status}: {body[:200]}")


def _chat(
    messages: list[dict],
    *,
    model: str,
    max_tokens: int = 1500,
    temperature: float = 0.4,
) -> str:
    api_key = os.environ["OPENROUTER_API_KEY"]
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://richardawe.github.io/ai-architect-cv",
        "X-Title": "Richard Awe CV Generator",
    }
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    for attempt in range(_MAX_ATTEMPTS):
        try:
            with httpx.Client(timeout=120) as client:
                resp = client.post(
                    f"{OPENROUTER_BASE}/chat/completions",
                    headers=headers,
                    json=payload,
                )
            if resp.status_code in _RETRYABLE and attempt < _MAX_ATTEMPTS - 1:
                delay = 2 ** attempt          # 2s, 4s, 8s  (EU261 pattern)
                print(f"Retryable {resp.status_code}, retrying in {delay}s…", file=sys.stderr)
                time.sleep(delay)
                continue
            if not resp.is_success:
                raise OpenRouterError(resp.status_code, resp.text)
            return resp.json()["choices"][0]["message"]["content"].strip()
        except httpx.HTTPError as exc:
            if attempt < _MAX_ATTEMPTS - 1:
                delay = 2 ** attempt
                print(f"HTTP error {exc}, retrying in {delay}s…", file=sys.stderr)
                time.sleep(delay)
            else:
                raise OpenRouterError(0, str(exc)) from exc
    return ""


# ── Candidate context ─────────────────────────────────────────────────────────
CANDIDATE_CONTEXT = """
RICHARD AWE — AI ARCHITECT & FULL-STACK ENGINEER
Contact: richard3d7@gmail.com | Richard.Awe@3d7tech.com | github.com/richardawe
Founder, 3d7 Technologies

PROFESSIONAL IDENTITY:
Richard designs, builds, and deploys AI-powered systems across legal-tech, political
intelligence, energy trading, browser-native ML, humanitarian response, edtech, and media.
His signature approach: hybrid deterministic/LLM architectures — code handles
correctness-critical decisions; AI handles language, extraction, and generation.
Every project ships with GitHub Actions pipelines, not just working demos.

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
- Other: libsodium, JWT, Playwright, Tesseract OCR, Gmail API, OAuth 2.0,
         Remotion, MediaRecorder API, Web Workers API

FEATURED PROJECTS (2025–2026):

1. EU261 Auto-Claim Agent (Legal-Tech · Agentic) — Phase 1 Live
Role: Lead AI Architect & Developer | github.com/richardawe/Eu261
Agentic system autonomously filing EU261/2004 flight compensation claims end-to-end.
Architecture: GitHub Actions as distributed state machine (11 event-driven workflows
on Issue label transitions — no external queue or DB). Hybrid AI/rules: deterministic
Python rules engine decides eligibility; LLM handles only structured fact extraction.
libsodium PII encryption, JWT consent tokens, pluggable per-airline Playwright adapters.
Stack: Python 3.12, GitHub Actions (11 workflows), YAML rules engine, libsodium,
JWT, Playwright, pytest

2. UK Politics AI Positioning Matrix (Political Intelligence · Cron) — Live 6h updates
Role: Lead AI Architect & Developer
Live dashboard mapping UK party positions onto a 2×2 political compass, updating
every 6 hours via GitHub Actions cron. Multi-provider AI abstraction (OpenRouter/
OpenAI/Anthropic swappable at runtime). Credibility-weighted signal scoring.
Fully static Next.js/GitHub Pages — zero hosting cost.
Stack: Next.js, TypeScript, React, Recharts, Tailwind CSS, GitHub Pages

3. EV Showcase (Jamstack AI · Daily Pipeline) — Live daily updates
Role: Lead Developer | github.com/richardawe/Electric-vehicles
Autonomous daily EV database updates via LLM + three-tier Wikipedia image pipeline.
Schema validation before every commit. Pure static with zero hosting cost.
Stack: Python 3.12, OpenRouter, GitHub Actions (daily cron), Static HTML/CSS/JS

4. Brand Reel — Webpage to Brand Video (Browser-Native · Video Generation) — Live
Role: Lead Developer | richardawe.github.io/agents
Client-side brand video generation from any webpage — no server, no upload, no key.
Remotion preview + Canvas 2D / MediaRecorder export pipeline.
Stack: React, TypeScript, Vite, Remotion, Canvas 2D API, MediaRecorder (VP9)

5. BrowserML — Client-Side AI Task Runner (Browser-Native ML) — Live
Role: Lead Developer | github.com/richardawe/3dpages
Text summarisation, Q&A, and translation 100% client-side via Transformers.js + Workers.
Stack: Vanilla JS, Transformers.js v2.17.2, Web Workers API, GitHub Pages

6. EnergyTRM — Energy Trading & Risk Management — In Production at energytrm.com
Role: Lead Developer | github.com/richardawe/energytrm
Full ETRM portal: deal capture, VaR/stress testing, settlement across 7 phases.
Two-stage GitHub Actions CI/CD (MySQL 8.0 service container + FTP deploy to cPanel).
Stack: Laravel 13, PHP 8.4, MySQL 8.0, Alpine.js, Bootstrap 5, GitHub Actions

EARLIER PROJECTS:
- AI Metrics Intelligence Platform: Enterprise AI maturity diagnostic.
  React, Python/Flask, LLM orchestration, SQL + vector storage.
- AI Agent Workflow System: 5-step multi-agent pipeline (Plan→Research→Execute→QA→Refine).
  Python, Flask, OpenRouter. github.com/richardawe/testing-agents
- Intelligent Email Assistant: Gmail OAuth 2.0, RAG with ChromaDB, human-in-the-loop.
  Python, Flask, OpenRouter, Gmail API. github.com/richardawe/intelligent-email-assistant
- DataRadar — Document Intelligence: Auto-routes to SQL or vector DB; PDF/Excel/OCR.
  Python, Node.js, Tesseract OCR, ChromaDB, PostgreSQL.
- Humanitarian Intelligence Platform Nigeria: Geospatial crisis dashboards.
  Node.js, React. github.com/richardawe/Humanitarian-Intelligence-Platform-Nigeria
- Kidemia — AI Learning Platform: Adaptive education for children.
  React, Node.js. github.com/richardawe/kidemia-quest-learn
- RegAlertPro — Regulatory Compliance SaaS: Federal Register + LLM scoring.
  Laravel, React. $499/month subscription tier.
- DocumentHelp.ai: AI business document generator (co-developer). React/Vite, OpenAI API.

PROFESSIONAL BACKGROUND (Enterprise 2015–Present):
- Mar 2025 – Present  : Lead Business Analyst, Fitch Ratings
- Apr 2024 – Mar 2025 : Product Owner, 3D7 Technologies
- Feb 2023 – Apr 2024 : Lead Business Analyst, RAC Limited
- Jan 2022 – Jan 2023 : Lead Business Analyst, HMRC
- Aug 2020 – Dec 2021 : Lead Business Analyst, European Central Bank
- Apr 2019 – Feb 2020 : Lead Business Analyst, Lloyds Banking Group
- Oct 2015 – Apr 2019 : Senior Business Analyst, HSBC
"""

CV_SYSTEM_PROMPT = f"""You are a professional CV writer. Generate a tailored, compelling CV for
Richard Awe based on the job description provided.

INSTRUCTIONS:
- Read the job description carefully; identify key requirements and keywords
- Open with a 3–4 sentence professional summary targeting this specific role
- Select 3–5 most relevant projects; describe each in 2–3 sentences
- List technical skills grouped by category, ordered by relevance to this role
- Include the full professional experience timeline
- Mirror keywords from the job description naturally; use strong action verbs
- Format in clean markdown: ## for sections, **bold** for roles/companies, - for bullets
- Length: 700–1000 words total
- Only use Richard's real experience — do not fabricate anything

RICHARD'S BACKGROUND:
{CANDIDATE_CONTEXT}"""


# ── Main ──────────────────────────────────────────────────────────────────────
def main() -> None:
    job_description = os.environ.get("JOB_DESCRIPTION", "").strip()
    if not job_description:
        print("ERROR: JOB_DESCRIPTION env var is empty", file=sys.stderr)
        sys.exit(1)

    model = os.environ.get("CV_MODEL") or "openai/gpt-oss-120b:free"
    print(f"Generating CV with model: {model}", file=sys.stderr)

    cv_text = _chat(
        messages=[
            {"role": "system", "content": CV_SYSTEM_PROMPT},
            {"role": "user", "content": f"Generate a tailored CV for this role:\n\n{job_description}"},
        ],
        model=model,
    )

    # Write output — mirrors EU261's write-then-commit pattern
    out_dir = Path("cv-output")
    out_dir.mkdir(exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    (out_dir / "latest.md").write_text(cv_text, encoding="utf-8")
    (out_dir / f"{timestamp}.md").write_text(cv_text, encoding="utf-8")

    print(f"Written: cv-output/latest.md and cv-output/{timestamp}.md", file=sys.stderr)


if __name__ == "__main__":
    main()
