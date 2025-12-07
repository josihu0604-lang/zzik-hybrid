# ZZIK Agent System - Quick Start Examples

This guide provides practical examples for using the ZZIK Production AI Coding Agent System.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Example 1: Simple Coding Task](#example-1-simple-coding-task)
- [Example 2: Multi-Agent Workflow](#example-2-multi-agent-workflow)
- [Example 3: GitHub Integration](#example-3-github-integration)
- [Example 4: Custom Tools](#example-4-custom-tools)
- [Example 5: Security and Monitoring](#example-5-security-and-monitoring)

## Basic Setup

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-api03-xxx
GITHUB_TOKEN=ghp_xxx

# Optional
DATABASE_URL=postgresql://user:pass@localhost:5432/zzik
SLACK_BOT_TOKEN=xoxb-xxx
BRAVE_API_KEY=xxx
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Tests

```bash
pnpm test src/__tests__/agent
```

## Example 1: Simple Coding Task

Create a file `examples/simple-task.ts`:

```typescript
import { AgentFactory } from '../src/agent/core/agent-factory';

async function runSimpleTask() {
  // Create a coding agent
  const codingAgent = await AgentFactory.createAgent('coding');

  // Send a task
  await codingAgent.query(`
    Create a TypeScript function that validates email addresses.
    Requirements:
    - Use RegExp for validation
    - Handle edge cases
    - Add JSDoc comments
    - Include error handling
  `);

  // Collect response
  for await (const message of codingAgent.receive_response()) {
    if (message.type === 'assistant') {
      for (const block of message.content) {
        if (block.type === 'text') {
          console.log('Agent Response:', block.text);
        }
      }
    }
  }

  // Cleanup
  await AgentFactory.cleanup();
}

runSimpleTask().catch(console.error);
```

Run it:

```bash
tsx examples/simple-task.ts
```

## Example 2: Multi-Agent Workflow

Create a file `examples/workflow.ts`:

```typescript
import { AgentCoordinator, createTask } from '../src/agent';

async function runMultiAgentWorkflow() {
  // Initialize coordinator
  const coordinator = new AgentCoordinator();
  await coordinator.initialize();

  // Define workflow tasks
  const tasks = [
    // Step 1: Analyze requirements
    createTask(
      'analyze',
      'coordinator',
      'Analyze the requirements for implementing user authentication',
      []
    ),

    // Step 2: Generate code (depends on analysis)
    createTask('implement', 'coding', 'Implement user authentication with JWT tokens', ['analyze']),

    // Step 3: Generate tests (depends on implementation)
    createTask('test', 'test', 'Create unit tests for authentication system', ['implement']),

    // Step 4: Review code (depends on implementation)
    createTask('review', 'review', 'Review the authentication implementation for security issues', [
      'implement',
    ]),

    // Step 5: Generate docs (depends on implementation)
    createTask('docs', 'docs', 'Create documentation for the authentication API', ['implement']),
  ];

  // Execute workflow
  console.log('Starting multi-agent workflow...');
  const results = await coordinator.orchestrateWorkflow(tasks);

  // Print results
  console.log('\n=== Workflow Results ===\n');
  for (const [taskId, result] of results.entries()) {
    console.log(`Task: ${taskId}`);
    console.log(`Result: ${result}\n`);
  }

  // Cleanup
  await coordinator.cleanup();
}

runMultiAgentWorkflow().catch(console.error);
```

## Example 3: GitHub Integration

Create a file `examples/github-integration.ts`:

```typescript
import { AgentFactory } from '../src/agent/core/agent-factory';
import { GitHubCodingAgent } from '../src/agent/integrations/github-agent';

async function handleGitHubIssue() {
  // Create coding agent
  const client = await AgentFactory.createAgent('coding');

  // Initialize GitHub agent
  const githubAgent = new GitHubCodingAgent(
    client,
    'owner', // Your GitHub username or org
    'repo', // Your repository name
    'main' // Base branch
  );

  // Define an issue to handle
  const issue = {
    number: 123,
    title: 'Add password reset functionality',
    body: `
      Implement password reset feature:
      - Send reset email with token
      - Validate token on reset page
      - Update password securely
      - Log the user out of other sessions
    `,
    labels: ['feature', 'authentication'],
    assignees: ['agent'],
    state: 'open' as const,
  };

  // Handle the issue (creates branch, implements, and creates PR)
  console.log('Handling GitHub issue...');
  const pr = await githubAgent.handleIssue(issue);

  console.log('\n=== Created Pull Request ===');
  console.log(`PR #${pr.number}: ${pr.title}`);
  console.log(`Branch: ${pr.head}`);
  console.log(`Draft: ${pr.draft}`);

  // Cleanup
  await AgentFactory.cleanup();
}

handleGitHubIssue().catch(console.error);
```

## Example 4: Custom Tools

Create a file `examples/custom-tools.ts`:

```typescript
import { executeTool } from '../src/mcp/servers/zzik-tools';

async function useCustomTools() {
  console.log('=== Using ZZIK Custom Tools ===\n');

  // 1. Analyze codebase
  console.log('1. Analyzing codebase...');
  const analysisResult = await executeTool('analyze_codebase', {
    path: '/workspace/src',
    depth: 3,
    patterns: ['*.ts', '*.tsx'],
  });

  console.log('Analysis:', analysisResult.content[0].text);

  // 2. Deploy preview
  console.log('\n2. Deploying preview...');
  const deployResult = await executeTool('deploy_preview', {
    branch: 'feature/new-feature',
    environment: 'preview',
  });

  console.log('Deployment:', deployResult.content[0].text);

  // 3. Run migration
  console.log('\n3. Running database migration...');
  const migrationResult = await executeTool('run_migration', {
    direction: 'up',
    target: '20250101_add_users_table',
  });

  console.log('Migration:', migrationResult.content[0].text);

  // 4. Validate experience
  console.log('\n4. Validating ZZIK experience...');
  const validationResult = await executeTool('validate_experience', {
    experienceId: 'exp_123',
    checkInventory: true,
    checkPricing: true,
  });

  console.log('Validation:', validationResult.content[0].text);
}

useCustomTools().catch(console.error);
```

## Example 5: Security and Monitoring

Create a file `examples/security-monitoring.ts`:

```typescript
import { validateToolExecution, getAuditLogs } from '../src/agent/hooks/security-hooks';
import { agentMetrics, trackTaskExecution } from '../src/observability/tracing';

async function demonstrateSecurity() {
  console.log('=== Security & Monitoring Demo ===\n');

  // 1. Test security validation
  console.log('1. Testing dangerous command blocking...');

  const dangerousCommand = {
    tool_name: 'bash',
    tool_input: {
      command: 'rm -rf /',
    },
  };

  const result = await validateToolExecution(dangerousCommand, 'test-id', {
    sessionId: 'test',
    agentType: 'coding' as const,
  });

  if (result.hookSpecificOutput?.permissionDecision === 'deny') {
    console.log('✓ Dangerous command blocked successfully!');
    console.log('  Reason:', result.hookSpecificOutput.permissionDecisionReason);
  }

  // 2. Track task execution with metrics
  console.log('\n2. Tracking task execution...');

  await trackTaskExecution('example_task', async () => {
    // Simulate task work
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  // Get metrics
  const metrics = agentMetrics.getAllMetrics();
  console.log('✓ Task metrics recorded');
  console.log('  Total tasks:', metrics.counters['agent.tasks.total{type="example_task"}'] || 0);

  // 3. View audit logs
  console.log('\n3. Audit logs...');
  const logs = getAuditLogs();
  console.log(`✓ ${logs.length} audit entries recorded`);

  if (logs.length > 0) {
    console.log('  Latest entry:');
    console.log('  -', logs[logs.length - 1]);
  }
}

demonstrateSecurity().catch(console.error);
```

Run it:

```bash
tsx examples/security-monitoring.ts
```

## Running All Examples

Create a script to run all examples:

```bash
#!/bin/bash

echo "Running ZZIK Agent System Examples"
echo "==================================="

echo -e "\n1. Simple Task Example"
tsx examples/simple-task.ts

echo -e "\n2. Workflow Example"
tsx examples/workflow.ts

echo -e "\n3. GitHub Integration Example"
tsx examples/github-integration.ts

echo -e "\n4. Custom Tools Example"
tsx examples/custom-tools.ts

echo -e "\n5. Security & Monitoring Example"
tsx examples/security-monitoring.ts

echo -e "\n✓ All examples completed!"
```

Save as `run-examples.sh` and make it executable:

```bash
chmod +x run-examples.sh
./run-examples.sh
```

## Next Steps

1. **Production Deployment**: See `docs/AGENT_SYSTEM.md` for deployment instructions
2. **Custom Agents**: Add your own specialized agents in `src/agent/core/agent-factory.ts`
3. **Custom Tools**: Extend `src/mcp/servers/zzik-tools.ts` with your own tools
4. **Integration**: Connect to your CI/CD pipelines and monitoring systems

## Troubleshooting

### Common Issues

**Issue**: `ANTHROPIC_API_KEY not found`

- Solution: Create `.env` file with your API key

**Issue**: Tests failing

- Solution: Run `pnpm install` to ensure dependencies are installed

**Issue**: GitHub integration not working

- Solution: Check `GITHUB_TOKEN` environment variable

## Resources

- [Full Documentation](./docs/AGENT_SYSTEM.md)
- [API Reference](./src/agent/README.md)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)
