# Gemini 3.0 Pro Agent Swarm for ZZIK Hybrid V2

This directory contains the configuration and persona definitions for the specialized Gemini 3.0 Pro agents designed to maintain and evolve the ZZIK Hybrid project.

## Agent Architecture

We utilize the **Gemini 3.0 Pro** capabilities:
- **Thinking Level Control**: Agents are configured with specific reasoning depths (1-5).
- **Deep Research**: Agents can browse the web for latest CVEs, documentation, and best practices.
- **Thought Signatures**: Transparent reasoning logs for debugging agent decisions.
- **Structured Outputs**: Strict JSON schemas for inter-agent communication.

## Active Agents

| Agent ID | Name | Role | Thinking Level | Key Tools |
|----------|------|------|----------------|-----------|
| `test-guardian` | **The Test Guardian** | QA & Test Suite Manager | Level 2 (Analytical) | Playwright, Vitest, GitHub Actions |
| `security-sentinel` | **Security Sentinel** | Security Auditor | Level 3 (Paranoid) | OWASP Scanner, Deep Research |
| `performance-architect` | **Speed Architect** | Performance Optimizer | Level 2 (Technical) | Lighthouse, Bundle Analyzer |
| `code-evolutionary` | **Code Evolutionary** | Core Developer | Level 1 (Efficient) | VS Code, Terminal |

## Usage

These agents are designed to be run with the Gemini 3.0 CLI or compatible agent frameworks.

```bash
# Example: Ask Test Guardian to investigate a failure
gemini agent run test-guardian --task "Analyze the flaky test in review-system.spec.ts"
```
