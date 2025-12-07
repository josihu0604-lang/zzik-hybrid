# ZZIK Agent System

Production-grade AI coding agent system with multi-agent architecture and MCP integration.

## Overview

This directory contains the complete implementation of the ZZIK Production AI Coding Agent System, built according to 2025 best practices and the MCP v1.0 specification.

## Directory Structure

```
src/agent/
├── types.ts                    # TypeScript types and interfaces
├── index.ts                    # Main entry point and exports
├── core/
│   └── agent-factory.ts       # Agent creation and configuration
├── orchestrator/
│   └── coordinator.ts         # Multi-agent task orchestration
├── integrations/
│   └── github-agent.ts        # GitHub issue/PR automation
└── hooks/
    └── security-hooks.ts      # Security validation and audit logging
```

## Quick Start

```typescript
import { initializeAgentSystem, runCodingWorkflow } from './src/agent';

// Initialize the system
const coordinator = await initializeAgentSystem();

// Run a workflow
await runCodingWorkflow(coordinator, 'Implement user authentication');
```

## Agent Types

| Type          | Purpose            | Tools                     |
| ------------- | ------------------ | ------------------------- |
| `coordinator` | Task orchestration | Router, Memory            |
| `coding`      | Code generation    | File, GitHub, LSP         |
| `test`        | Test generation    | Test runners, Coverage    |
| `review`      | Code review        | Static analysis, Security |
| `docs`        | Documentation      | Markdown, Diagrams        |
| `deploy`      | CI/CD              | GitHub Actions, Docker    |

## Key Features

### 1. Multi-Agent Architecture

```typescript
const coordinator = new AgentCoordinator();
await coordinator.initialize();

const tasks = [
  createTask('analyze', 'coordinator', 'Analyze requirements', []),
  createTask('implement', 'coding', 'Write code', ['analyze']),
  createTask('test', 'test', 'Create tests', ['implement']),
];

const results = await coordinator.orchestrateWorkflow(tasks);
```

### 2. Security-First Design

All tool executions are validated through security hooks:

- Dangerous command blocking (rm -rf, sudo, etc.)
- Protected path validation (.env, secrets, etc.)
- SSRF protection for network requests
- Comprehensive audit logging

```typescript
// Automatically blocks dangerous commands
const result = await validateToolExecution(
  {
    tool_name: 'bash',
    tool_input: { command: 'rm -rf /' },
  },
  'tool-id',
  context
);
// Result: { permissionDecision: 'deny' }
```

### 3. GitHub Integration

Autonomous issue handling like GitHub Copilot:

```typescript
const githubAgent = new GitHubCodingAgent(client, 'owner', 'repo');
const pr = await githubAgent.handleIssue(issue);
// Creates branch, implements changes, creates PR
```

### 4. Observability

Built-in tracing and metrics:

```typescript
import { trackTaskExecution, agentMetrics } from '../observability/tracing';

await trackTaskExecution('task_type', async () => {
  // Task logic
});

const metrics = agentMetrics.getAllMetrics();
```

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...

# Optional
DATABASE_URL=postgresql://...
SLACK_BOT_TOKEN=xoxb-...
BRAVE_API_KEY=...
```

### Custom MCP Servers

Edit `src/mcp/registry.ts`:

```typescript
export const mcpServers = {
  custom_server: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@your/mcp-server'],
    env: { API_KEY: process.env.CUSTOM_API_KEY },
  },
};
```

## Testing

```bash
# Run all agent tests
pnpm test src/__tests__/agent

# Run specific test file
pnpm test src/__tests__/agent/security-hooks.test.ts

# Run with coverage
pnpm test:coverage src/__tests__/agent
```

## Examples

See [EXAMPLES.md](../../docs/EXAMPLES.md) for detailed examples:

1. Simple coding task
2. Multi-agent workflow
3. GitHub integration
4. Custom tools usage
5. Security and monitoring

## Production Deployment

### Docker

```bash
docker build -f Dockerfile.agent -t zzik/agent:latest .
docker run -d -e ANTHROPIC_API_KEY=xxx -p 3000:3000 zzik/agent:latest
```

### Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
```

See [AGENT_SYSTEM.md](../../docs/AGENT_SYSTEM.md) for complete deployment guide.

## API Reference

### AgentFactory

```typescript
class AgentFactory {
  static async createAgent(type: AgentType, options?: Partial<AgentConfig>): Promise<any>;

  static async cleanup(): Promise<void>;
}
```

### AgentCoordinator

```typescript
class AgentCoordinator {
  async initialize(): Promise<void>;
  async executeTask(task: Task): Promise<unknown>;
  async orchestrateWorkflow(tasks: Task[]): Promise<Map<string, unknown>>;
  async cleanup(): Promise<void>;
}
```

### GitHubCodingAgent

```typescript
class GitHubCodingAgent {
  async handleIssue(issue: GitHubIssue): Promise<PullRequest>;
  async handleReviewComment(pr: PullRequest, comment: ReviewComment): Promise<void>;
  async runAutomatedChecks(pr: PullRequest): Promise<CheckResults>;
}
```

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Review audit logs regularly** - Check for suspicious activity
3. **Use minimal permissions** - Grant only necessary access
4. **Update dependencies** - Keep security patches current
5. **Validate all inputs** - Don't trust external data

## Troubleshooting

### Common Issues

**Agent initialization fails**

- Check API keys are set correctly
- Verify network connectivity
- Check API quota limits

**Security hook blocks valid command**

- Review blocked patterns in `hooks/security-hooks.ts`
- Add exceptions if needed
- Check audit logs for details

**Workflow hangs**

- Check for circular dependencies
- Verify all dependency tasks exist
- Enable debug logging

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update documentation
4. Run linters before committing

```bash
pnpm lint:fix
pnpm type-check
pnpm test:run
```

## License

MIT License - See LICENSE file for details

## Support

- GitHub Issues: [Create an issue](https://github.com/josihu0604-lang/zzik-hybrid/issues)
- Documentation: See `docs/` directory
- Examples: See `docs/EXAMPLES.md`

---

**Built with ❤️ by the ZZIK Team**
