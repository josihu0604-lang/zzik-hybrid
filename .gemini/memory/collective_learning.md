# Gemini Agent Collective Memory
*Last Updated: 2025-12-09*

## 🧠 Learned Patterns

### 1. Architecture Standards (Learned by Code Evolutionary)
- **Path Structure**: All business logic stores must reside in `src/lib/stores/`, NOT `src/stores/`.
- **API Handling**: `fetch` responses vary. Always check `Array.isArray(data)` vs `data.data` vs `data[entityName]`.
- **Zustand Usage**: Selectors like `getReviewCount` must be exposed directly in the store for testing ease, rather than just relying on hooks.

### 2. Testing Protocols (Learned by Test Guardian)
- **Missing Module Detection**: If a test fails with "Failed to resolve import", immediately check file existence before analyzing code logic.
- **TDD Workflow**: `types` -> `store` -> `hooks` -> `components` order prevents circular dependency issues during implementation.

### 3. Security Baselines (Learned by Security Sentinel)
- **State Protection**: Zustand stores containing user progress (Points, Wallet) must be protected against client-side manipulation in production (need server-side validation).
