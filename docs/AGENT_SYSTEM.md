# ZZIK Production AI Coding Agent System

> **Enterprise-grade autonomous coding agent with MCP integration**
>
> Based on Claude Agent SDK and MCP v1.0 (2025-06-18 spec)

## Overview

This is a production-level AI coding agent system that implements:

- ✅ **Multi-Agent Architecture** - Specialized agents for different tasks (Coding, Test, Review, Docs, Deploy)
- ✅ **MCP Protocol Integration** - Industry-standard tool integration using Model Context Protocol
- ✅ **Security-First Design** - Pre/post execution hooks, dangerous command blocking, audit logging
- ✅ **GitHub Integration** - Autonomous issue handling and PR management like GitHub Copilot
- ✅ **Production Deployment** - Docker & Kubernetes configurations with best practices
- ✅ **Observability** - Distributed tracing and metrics collection

## Architecture

```
┌─────────────────────────────────────────┐
│       ZZIK Agent System                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐   ┌───────────────┐  │
│  │ Coordinator  │◄─►│  Specialized  │  │
│  │   Agent      │   │    Agents     │  │
│  └──────┬───────┘   └───────────────┘  │
│         │                               │
│         ▼                               │
│  ┌─────────────────────────────────┐   │
│  │      MCP Server Layer           │   │
│  │  • GitHub  • Filesystem         │   │
│  │  • Database • Memory            │   │
│  │  • Search  • Custom Tools       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Security Layer             │   │
│  │  • Pre-execution Hooks          │   │
│  │  • Dangerous Command Blocking   │   │
│  │  • Audit Logging                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install
```

### Basic Usage

```typescript
import { initializeAgentSystem, runCodingWorkflow, shutdown } from './src/agent';

// Initialize the agent system
const coordinator = await initializeAgentSystem();

// Run a coding workflow
await runCodingWorkflow(coordinator, 'Implement user authentication');

// Cleanup
await shutdown(coordinator);
```

## Core Components

See full documentation in the repository's `src/agent/` directory.

## License

MIT License
