---
name: zzik-development
description: ZZIK Popup Crowdfunding Platform 개발 가이드. "참여하면 열린다" 핵심 플로우.
---

# ZZIK Development Guide

## Project Identity

```yaml
Name: ZZIK (찍)
Tagline: "참여하면 열린다" / "Join to Open"
Concept: Popup Crowdfunding Platform
Core Value: 수요가 증명되면, 팝업이 열린다

Directory: /home/ubuntu/zzik-hybrid
```

## Quick Start

```bash
cd /home/ubuntu/zzik-hybrid
pnpm install
pnpm dev  # http://localhost:3000
```

## Tech Stack

```yaml
Frontend:
  - Next.js 15 (App Router)
  - TypeScript 5.6 (Strict)
  - Tailwind CSS + Framer Motion

Backend:
  - Supabase (Auth, DB, Storage)
  - PostgreSQL + pgvector (768-dim)

Maps:
  - Mapbox GL (Visual)
  - Kakao API (Data, Social Login)

AI:
  - Gemini Vision (OCR)
  - text-embedding-004 (Recommendations)
```

## Core User Flow

```
1. [발견] Home feed에서 펀딩 중인 팝업 발견
2. [참여] "참여하기" 원탭 (가입 없이 가능)
3. [대기] Progress Temperature로 긴장감
4. [오픈] 목표 달성 → 팝업 확정
5. [방문] Triple Verification → "찍음" 배지
6. [공유] 소셜 공유
```

## Key Files

```
src/app/page.tsx                    # Home feed
src/app/popup/[id]/page.tsx         # Popup detail
src/components/popup/PopupCard.tsx  # Funding card
src/lib/verification.ts             # Triple Verification
src/lib/participation.ts            # Participation logic
```

## Design System

```yaml
Brand Colors:
  Flame Coral: '#FF6B5B'  # 참여의 열기 (Primary)
  Deep Ember: '#CC4A3A'   # 강조
  Spark Yellow: '#FFD93D' # Leader Premium

Base Colors:
  Background: '#08090a'
  Surface: '#121314'
  Text Primary: '#f5f5f5'
  Text Secondary: '#a8a8a8'

Rule: 90% Neutral : 10% Accent
Theme: Dark Mode ONLY
```

## Commands

```bash
pnpm dev          # Development
pnpm build        # Production build
pnpm type-check   # TypeScript
pnpm lint         # ESLint
pnpm test         # Vitest
```

## Development Rules

1. TypeScript strict (no `any`)
2. Zod validation for all API inputs
3. RLS enabled for all Supabase queries
4. Components under 200 lines
5. Mobile-first responsive design
