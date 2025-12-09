# Core Architecture: ZZIK Agentic Protocol (v2026)

> **"True AI is not about Chatbots. It's about Reasoning."**

This document outlines the architectural shift from "Scripted Demos" to "Reasoning Agents" powered by Gemini 1.5 Pro (and future Gemini 3 Pro specs).

## 1. The "Glow" Engine (Skin Analysis)
Instead of random number generation, we implement a **Vision-to-Vector Pipeline**.

### Workflow
1.  **Input:** High-res selfie from user (Client).
2.  **Processing:** 
    *   Image is sliced into 4 regions (Forehead, Cheeks, Chin).
    *   `Gemini Pro Vision` analyzes each region for specific biomarkers: `[Hydration, Sebum, Pigmentation, Wrinkles]`.
3.  **Reasoning:**
    *   The model compares these biomarkers against a `Vector Database` of "Ideal Glass Skin".
    *   It generates a "Gap Analysis" (Why is this user 87 points, not 100?).
4.  **Output:** Structured JSON with actionable advice, not generic text.

## 2. The "Seongsu" Curator (Contextual RAG)
Instead of keyword matching ("Cafe" -> List of Cafes), we implement **Contextual Load Balancing**.

### Workflow
1.  **Data Ingestion:** Real-time crawl of waiting app data (CatchTable/Tabling) + Instagram Hashtag velocity.
2.  **User Context:** "User hates waiting" + "Likes Jazz" + "Current Time: 14:00 (Peak)".
3.  **Agent Reasoning:**
    *   *Observation:* "Blue Bottle has 40 min wait."
    *   *Observation:* "User gets stressed by crowds."
    *   *Reasoning:* "Sending user to Blue Bottle = Negative Experience."
    *   *Search:* "Find Jazz cafe within 500m with < 10 min wait."
4.  **Action:** Recommend "Low Coffee Stand" (Wait: 0, Vibe: Jazz).

## 3. The "Sales" Phantom (Autonomous B2B)
Instead of a mail merge script, we implement a **Persona-Matching Agent**.

### Workflow
1.  **Target Analysis:** Agent reads the target brand's last 5 Instagram posts.
2.  **Tone Identification:** Is the brand "Formal/Medical" or "Hip/Street"?
3.  **Drafting:** 
    *   *If Medical:* Use words like "Clinical trial," "Retention," "ROI."
    *   *If Street:* Use words like "Vibe," "Traffic," "Hype."
4.  **Review:** Agent self-scores the draft before sending. "Is this cringe?" -> If yes, rewrite.

---

**This architecture ensures we are not just a 'Wrapper' but a 'Value-Add Intelligence Layer'.**
