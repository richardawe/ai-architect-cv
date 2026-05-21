# I Replaced My CV With an AI Agent. Here's Why That's the Future of Work.

Let me tell you what I actually built — and then let me tell you what it means.

The repo is here: **https://github.com/richardawe/ai-architect-cv**
The live site is here: **https://richardawe.github.io/ai-architect-cv**

---

## The Problem With CVs

A CV is a static document. It's a snapshot of a human being — frozen in time, compressed into two pages of bullet points, filtered through a recruiter's keyword scanner in about 7 seconds.

You spend 10 years building genuinely interesting things. You compress them into two pages. Someone scans it in 7 seconds. That's the pipeline.

There is something deeply broken about this.

---

## The Idea

What if your CV could talk back?

What if instead of sending a PDF to a hiring manager, you sent them an AI agent — pre-loaded with everything about you — that they could interrogate in real time? Ask it anything. "What's his experience with distributed systems?" "Has she led cross-functional teams?" "What's the most architecturally interesting thing he's built?"

No filtering. No keyword matching. No guessing from two-page summaries.

That's what I built. And I built it the way I build everything: with GitHub Actions as the backend, Python as the engine, and zero servers.

---

## What's Actually in the Repo

The site is a portfolio — my portfolio. It covers my work across legal-tech, political intelligence, energy trading, browser-native ML, and humanitarian response. Standard stuff.

But floating in the bottom right corner is a chat widget. Click it, and you're talking to an AI assistant that knows everything about me — every project, every architectural decision, every technology choice, my full employment history from HSBC to the European Central Bank to Fitch Ratings. Ask it anything. It answers in real time, streaming directly from OpenRouter's API.

There's also an admin page at `/admin`. I paste a job description. A GitHub Actions workflow fires. A Python script — modelled directly on the LLM engine I built for my EU261 Auto-Claim Agent — calls OpenRouter, generates a fully tailored CV in markdown, and commits it back to the repo. The entire thing runs in ~90 seconds. No server. No subscription fee. No SaaS. Just a GitHub Actions runner, a Python script, and one API key.

Here's the architecture in one sentence: **GitHub Actions is the compute layer, OpenRouter is the intelligence layer, GitHub Pages is the delivery layer.**

---

## The Technical Part (Stay With Me — It's Actually Interesting)

The chat widget has no backend. When you send a message, the static JavaScript calls the OpenRouter API directly from your browser. The API key is injected at deploy time by the GitHub Actions workflow — it's baked into a `chat-config.js` file that gets built into the Pages artifact but never committed to git. The file doesn't exist in the repository. It materialises on the runner, gets bundled into the deployment, and lives only on the CDN.

This is a serverless secret delivery pattern. No environment variables at runtime. No server to query. The secret is embedded at build time and served statically. It's the same philosophical approach as static site generators — but for credentials.

The CV generator is more interesting. It mirrors the exact architecture I used in my EU261 flight compensation agent — where GitHub Actions workflows fire on events, Python scripts call OpenRouter with structured prompts, and results get committed back to the repository. In the EU261 case, the "event" is a GitHub Issue being labelled. Here, the event is a `workflow_dispatch` trigger fired from an admin page via the GitHub API.

Same engine. Different domain. That's the point.

The Python client mirrors the EU261 pattern exactly: `httpx` for HTTP, four-attempt exponential backoff (2s, 4s, 8s, 16s) on 429/5xx responses, environment variable key injection, structured prompt engineering. The model is `openai/gpt-oss-120b:free` via OpenRouter — the same model I use in my EV Showcase pipeline to autonomously grow a vehicle database every 24 hours.

One LLM setup. Multiple domains. This is what reusable AI infrastructure looks like.

---

## The Bigger Point

I didn't build this because I needed a fancier CV.

I built it because I think CVs are going to become obsolete — and the replacement isn't a better PDF template. The replacement is an agent.

Here's the trajectory:

**Today:** You send a CV. A human reads it (maybe). An ATS scans it (definitely). You either pass a keyword filter or you don't.

**Near future:** You send an agent. A hiring manager — or more likely, their AI — interrogates the agent. The agent has full context, can answer follow-up questions, can demonstrate reasoning, can surface relevant experience in response to specific questions rather than guessing what's important in advance.

**Further future:** You don't send anything. Your agent is persistent. It monitors opportunities that match your profile, reaches out on your behalf, handles the first-pass screening, escalates to you only when there's genuine mutual fit. The whole top-of-funnel — the part that currently eats 80% of a job search — runs autonomously.

The CV as a document format made sense in 1950. It was the right abstraction for a world where the only way to communicate your professional history was a printed page. We are not in that world anymore.

---

## Why GitHub Actions Specifically

People ask me why I use GitHub Actions for everything instead of building "real" backends.

The honest answer: GitHub Actions is one of the most underrated compute platforms in existence.

It's free for public repos. It has a massive ecosystem of pre-built actions. It integrates natively with your code, your secrets, your deployment targets. It supports cron schedules, webhook triggers, manual dispatches, and event-driven state machines. It has a built-in audit log, a UI for monitoring runs, and retry semantics you don't have to build yourself.

For agentic workloads — where you need reliable, event-driven execution of Python scripts with access to secrets and the ability to write back to a repository — it's genuinely excellent. The EU261 agent uses 11 separate workflows as a distributed state machine. The CV generator adds one more. The UK Politics AI dashboard uses a 6-hourly cron. The EV Showcase uses a daily cron.

No Kubernetes. No Lambda. No monthly infrastructure bill. Just YAML files and Python scripts, running on Microsoft's compute for free.

---

## What This Looks Like at Scale

Imagine every professional on LinkedIn had an agent instead of a profile.

Not a chatbot. Not a GPT wrapper. An agent with deep context about that specific person — their real work, their actual architectural decisions, their genuine expertise — that could be queried by other agents representing employers.

Agent talks to agent. Human gets involved when there's actual fit. The entire screening layer — which currently exists to compensate for the information asymmetry between a CV and a job description — collapses.

That's not science fiction. Every technical component required to build this exists today. I built a proof of concept in a weekend using GitHub Actions, OpenRouter, and vanilla JavaScript. The infrastructure cost is effectively zero.

The barrier isn't technology. It's adoption.

---

## Try It

The agent is live. Go to **https://richardawe.github.io/ai-architect-cv** and click the chat button. Ask it anything.

"What's the most complex system you've built?"
"How does Richard approach AI/rules hybrid architectures?"
"What would you change about the EU261 project in hindsight?"

See what it says. See how it feels different from reading a PDF.

The repo — including the GitHub Actions workflows, the Python OpenRouter client, and the admin CV generator — is at **https://github.com/richardawe/ai-architect-cv**.

Fork it. Adapt it. Build your own agent.

The CV had a good run. I think its time is almost up.

---

*Richard Awe is an AI Architect and Full-Stack Engineer. Founder of 3d7 Technologies. He builds production AI systems with multi-agent orchestration, GitHub Actions pipelines, and a strong opinion that deterministic code should make the decisions that matter.*
