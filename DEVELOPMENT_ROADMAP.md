# ZZIK Global Platform - Development Roadmap

**Version**: 1.0  
**Created**: 2025-12-08  
**Timeline**: 8 Weeks to Japan Launch  

---

## Overview

This roadmap outlines the development plan for ZZIK's global pivot, targeting a Japan beta launch in Week 6 and Taiwan expansion in Week 10.

### Key Milestones

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| M1: Infrastructure Complete | Week 2 | DB, APIs, Stripe setup |
| M2: Payment Flow Live | Week 3 | Full payment cycle working |
| M3: Japan Ready | Week 5 | JA locale, JPY payments |
| M4: Japan Beta Launch | Week 6 | Limited rollout in Tokyo |
| M5: Taiwan Ready | Week 9 | zh-TW locale, TWD |
| M6: Taiwan Launch | Week 10 | Full Taiwan launch |

---

## Sprint 1 (Week 1-2): Foundation & Infrastructure

### Goals
- Complete database schema migration
- Implement missing Supabase CRUD operations
- Configure Stripe with real Price IDs
- Add IP-based geo detection

### Tasks

#### Priority: Critical (P0)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **DB-001**: Create Supabase migration for vip_tickets | Backend | 4h | ⏳ |
| **DB-002**: Create migration for payment_transactions | Backend | 2h | ⏳ |
| **DB-003**: Create migration for user_preferences | Backend | 2h | ⏳ |
| **DB-004**: Create migration for k_experiences | Backend | 4h | ⏳ |
| **DB-005**: Set up RLS policies | Backend | 4h | ⏳ |
| **VIP-001**: Implement saveTicket with Supabase | Backend | 3h | ⏳ |
| **VIP-002**: Implement getTicket with Supabase | Backend | 2h | ⏳ |
| **VIP-003**: Implement updateTicket with Supabase | Backend | 2h | ⏳ |
| **STRIPE-001**: Create products in Stripe Dashboard | DevOps | 2h | ⏳ |
| **STRIPE-002**: Create Price IDs for all tiers/regions | DevOps | 4h | ⏳ |
| **STRIPE-003**: Update stripe.ts with real Price IDs | Backend | 2h | ⏳ |

#### Priority: High (P1)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **GEO-001**: Integrate IP geolocation API (MaxMind/ipapi) | Backend | 4h | ⏳ |
| **GEO-002**: Create /api/geo-detect endpoint | Backend | 2h | ⏳ |
| **API-001**: Create /api/exchange-rates endpoint | Backend | 3h | ⏳ |
| **API-002**: Create /api/pricing/tiers endpoint | Backend | 2h | ⏳ |
| **API-003**: Create /api/user/preferences endpoint | Backend | 3h | ⏳ |

#### Priority: Medium (P2)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **TEST-001**: Unit tests for global-pricing.ts | QA | 4h | ⏳ |
| **TEST-002**: Unit tests for vip-ticket.ts | QA | 4h | ⏳ |
| **TEST-003**: Unit tests for currency.ts | QA | 2h | ⏳ |

### Sprint 1 Deliverables

- [ ] All database tables created in Supabase
- [ ] VIP ticket CRUD operations functional
- [ ] Real Stripe Price IDs configured
- [ ] Geo detection working with IP API
- [ ] Unit tests for core pricing logic

---

## Sprint 2 (Week 3-4): Payment Flow & i18n

### Goals
- Complete end-to-end payment flow
- Test webhook handling
- Expand i18n coverage
- Build subscription management UI

### Tasks

#### Priority: Critical (P0)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **PAY-001**: Test checkout session creation | Backend | 4h | ⏳ |
| **PAY-002**: Test webhook signature verification | Backend | 2h | ⏳ |
| **PAY-003**: Implement webhook handlers fully | Backend | 6h | ⏳ |
| **PAY-004**: Test subscription lifecycle | Backend | 4h | ⏳ |
| **PAY-005**: Implement proration for upgrades | Backend | 4h | ⏳ |
| **UI-001**: Create checkout button component | Frontend | 4h | ⏳ |
| **UI-002**: Create subscription status component | Frontend | 4h | ⏳ |
| **UI-003**: Create upgrade/downgrade UI | Frontend | 6h | ⏳ |

#### Priority: High (P1)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **I18N-001**: Add zh-TW locale | Frontend | 6h | ⏳ |
| **I18N-002**: Add th locale | Frontend | 4h | ⏳ |
| **I18N-003**: Integrate i18n properly in BentoGrid | Frontend | 2h | ⏳ |
| **I18N-004**: Add pricing strings for all locales | Frontend | 4h | ⏳ |
| **I18N-005**: Add VIP tier descriptions for all locales | Frontend | 4h | ⏳ |

#### Priority: Medium (P2)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **TEST-004**: E2E tests for payment checkout | QA | 6h | ⏳ |
| **TEST-005**: E2E tests for webhook handling | QA | 4h | ⏳ |
| **DOC-001**: API documentation for payment endpoints | Backend | 4h | ⏳ |

### Sprint 2 Deliverables

- [ ] Full payment flow tested with Stripe test mode
- [ ] Webhook handlers for all payment events
- [ ] zh-TW and th locales added
- [ ] Subscription management UI complete
- [ ] E2E tests for payment flow

---

## Sprint 3 (Week 5-6): K-Experience & Japan Launch

### Goals
- Build K-Experience category pages
- Complete K-POP experience cards
- Launch Japan beta

### Tasks

#### Priority: Critical (P0)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **KX-001**: Create K-Experience listing page | Frontend | 8h | ⏳ |
| **KX-002**: Create K-Experience detail page | Frontend | 6h | ⏳ |
| **KX-003**: Create K-POP category page | Frontend | 6h | ⏳ |
| **KX-004**: Create experience card component | Frontend | 4h | ⏳ |
| **KX-005**: Implement experience search/filter | Frontend | 6h | ⏳ |
| **API-004**: Create /api/k-experiences endpoint | Backend | 4h | ⏳ |
| **API-005**: Create /api/k-experiences/[id] endpoint | Backend | 3h | ⏳ |
| **API-006**: Create /api/k-experiences/search endpoint | Backend | 4h | ⏳ |

#### Priority: High (P1)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **JP-001**: Verify all JP locale strings | i18n | 4h | ⏳ |
| **JP-002**: Add JP-specific content | Content | 8h | ⏳ |
| **JP-003**: Set up JP payment testing | DevOps | 4h | ⏳ |
| **JP-004**: Configure LINE integration research | Backend | 4h | ⏳ |
| **LAUNCH-001**: Set up staging environment | DevOps | 4h | ⏳ |
| **LAUNCH-002**: Configure monitoring (Sentry) | DevOps | 4h | ⏳ |
| **LAUNCH-003**: Set up analytics (GA4, Mixpanel) | DevOps | 4h | ⏳ |

#### Priority: Medium (P2)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **SEO-001**: Add OG meta tags for K-experiences | Frontend | 3h | ⏳ |
| **SEO-002**: Create sitemap for K-experiences | Backend | 2h | ⏳ |
| **PERF-001**: Optimize image loading | Frontend | 4h | ⏳ |

### Sprint 3 Deliverables

- [ ] K-Experience pages live
- [ ] K-POP category fully functional
- [ ] Japan beta launched (Tokyo area)
- [ ] Monitoring and analytics configured
- [ ] Staging environment operational

---

## Sprint 4 (Week 7-8): Iteration & Taiwan Prep

### Goals
- Iterate based on Japan beta feedback
- Prepare for Taiwan launch
- Add K-Drama pilgrimage features

### Tasks

#### Priority: High (P1)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **TW-001**: Verify zh-TW locale strings | i18n | 4h | ⏳ |
| **TW-002**: Add TW-specific content | Content | 8h | ⏳ |
| **TW-003**: Set up TWD payment testing | DevOps | 4h | ⏳ |
| **KD-001**: Create K-Drama category page | Frontend | 6h | ⏳ |
| **KD-002**: Create pilgrimage route feature | Frontend | 8h | ⏳ |
| **KD-003**: Create filming location map | Frontend | 6h | ⏳ |
| **ITER-001**: Fix bugs from Japan beta | All | 16h | ⏳ |
| **ITER-002**: UX improvements from feedback | Frontend | 8h | ⏳ |

#### Priority: Medium (P2)

| Task | Assignee | Est. Hours | Status |
|------|----------|------------|--------|
| **PARTNER-001**: Create partner dashboard MVP | Frontend | 16h | ⏳ |
| **PARTNER-002**: Create partner API endpoints | Backend | 8h | ⏳ |
| **ADMIN-001**: Create admin verification tools | Backend | 8h | ⏳ |

### Sprint 4 Deliverables

- [ ] Japan beta stable with bug fixes
- [ ] Taiwan launch ready
- [ ] K-Drama pilgrimage feature complete
- [ ] Partner dashboard MVP

---

## Technical Requirements

### Development Environment

```bash
# Required Tools
- Node.js 18+
- pnpm (preferred) or npm
- Supabase CLI
- Stripe CLI (for webhook testing)

# Environment Setup
cp .env.example .env.local
# Configure all required environment variables

# Local Development
pnpm install
pnpm dev

# Database Migration
supabase db push

# Stripe Webhook Testing
stripe listen --forward-to localhost:3000/api/payment/webhook
```

### Deployment Pipeline

```
Feature Branch
    ↓
Pull Request (Code Review)
    ↓
CI/CD (Tests, Lint, Type-check)
    ↓
Staging Deployment (Vercel Preview)
    ↓
QA Verification
    ↓
Production Deployment
```

### Definition of Done

A task is considered complete when:

1. ✅ Code is written and tested locally
2. ✅ Unit tests pass (if applicable)
3. ✅ Type-check passes (`npm run type-check`)
4. ✅ Lint check passes (`npm run lint`)
5. ✅ Code review approved
6. ✅ Deployed to staging and verified
7. ✅ Documentation updated (if applicable)

---

## Resource Allocation

### Team Structure (Recommended)

| Role | Count | Focus |
|------|-------|-------|
| Frontend Developer | 2 | UI, Components, i18n |
| Backend Developer | 2 | APIs, DB, Stripe |
| DevOps/SRE | 1 | Infrastructure, CI/CD |
| QA Engineer | 1 | Testing, Quality |
| Product Manager | 1 | Coordination, Priorities |

### Sprint Capacity

- **Sprint Length**: 2 weeks
- **Available Days**: 10 working days per sprint
- **Buffer**: 20% for unexpected issues

---

## Risk Management

### Known Risks

| Risk | Mitigation | Owner |
|------|------------|-------|
| Stripe API changes | Monitor changelog, test thoroughly | Backend |
| i18n translation quality | Native speaker review | PM |
| Database migration issues | Staged rollout, backups | DevOps |
| Japan launch delays | Feature prioritization | PM |

### Contingency Plans

1. **If payment integration delayed**: Launch with limited free tier
2. **If i18n incomplete**: English fallback for missing strings
3. **If Japan beta issues**: Rollback capability, feature flags

---

## Success Metrics

### Week 6 (Japan Beta)

| Metric | Target |
|--------|--------|
| App stability | < 0.1% crash rate |
| Payment success rate | > 95% |
| Page load time | < 3s |
| User signups | 1,000+ |

### Week 10 (Taiwan Launch)

| Metric | Target |
|--------|--------|
| MAU | 10,000+ |
| Paid conversion | 5%+ |
| NPS | 50+ |
| K-Experience views | 50,000+ |

---

## Appendix: Task ID Reference

### Prefix Legend

| Prefix | Category |
|--------|----------|
| DB | Database |
| VIP | VIP Ticket Module |
| STRIPE | Stripe Integration |
| GEO | Geo Detection |
| API | API Endpoints |
| PAY | Payment Flow |
| UI | User Interface |
| I18N | Internationalization |
| TEST | Testing |
| DOC | Documentation |
| KX | K-Experience |
| JP | Japan Launch |
| TW | Taiwan Launch |
| KD | K-Drama Features |
| SEO | Search Optimization |
| PERF | Performance |
| PARTNER | Partner Features |
| ADMIN | Admin Tools |
| ITER | Iteration/Fixes |
| LAUNCH | Launch Prep |

---

**Last Updated**: 2025-12-08  
**Next Review**: Weekly sprint planning

*ZZIK Inc. All Rights Reserved.*
