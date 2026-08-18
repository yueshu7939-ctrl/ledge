# Ledge

A private single-user monthly expense ledger. Single-file PWA (`public/index.html`),
Vercel Functions for the API, Upstash Redis for storage.

## Architecture

- `public/index.html` — the entire app. Markup, styles, and logic in one file. No framework, no build step.
- `api/data.js` — read/write the whole state blob to Upstash Redis. Key `ledge_v3`, with a fallback chain to `ledge_data` (pre-rename) and `ledge_v3_bak` (pre-write backup).
- `api/parse.js` — voice/text expense parsing via the Anthropic API.
- `vercel.json` — rewrites plus a daily cron on `/api/data`.

## Storage rules

The Upstash free tier **deletes** a database after 14 days with no requests. This has
already cost one outage. Two safeguards exist and must not be removed:

1. The daily cron in `vercel.json` pings `/api/data` to keep the instance alive.
2. `api/data.js` refuses to overwrite stored months with an empty payload (409), and
   the client locks saving whenever a load fails.

Never weaken either without a replacement. A silent read failure used to cascade into
a silent overwrite of real records.

## Design System

Always read `DESIGN.md` before making any visual or UI decision. Font choices, colours,
spacing, radius, and aesthetic direction are defined there.

The direction is Swiss Brutalist (大字报). Its hard prohibitions — no border-radius, no
backdrop-filter, no box-shadow, no decorative gradients, one accent colour — are the
system, not preferences. Do not deviate without explicit user approval.

Content is bilingual (Chinese and English mixed freely in transaction descriptions).
Every font stack must declare a CJK face explicitly or the type system breaks silently.

In QA or review, flag any code that does not match `DESIGN.md`.
