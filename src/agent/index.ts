/**
 * Main Entry Point for ZZIK Production Agent System
 * Demonstrates agent initialization and basic workflows
 */

import { AgentCoordinator, createTask } from './orchestrator/coordinator';
import { GitHubCodingAgent } from './integrations/github-agent';
import { AgentFactory } from './core/agent-factory';
import { agentMetrics, trackTaskExecution } from '../observability/tracing';

/**
 * Initialize and run the agent system
 */
export async function initializeAgentSystem(): Promise<AgentCoordinator> {
  console.log('[AgentSystem] Initializing production agent system...');

  const coordinator = new AgentCoordinator();
  await coordinator.initialize();

  console.log('[AgentSystem] Agent system initialized successfully');
  return coordinator;
}

/**
 * Example: Handle a coding task workflow
 */
export async function runCodingWorkflow(
  coordinator: AgentCoordinator,
  issueDescription: string
): Promise<void> {
  console.log('[AgentSystem] Starting coding workflow...');

  // Create tasks with dependencies
  const tasks = [
    createTask('analyze', 'coordinator', 'Analyze requirements and create plan', []),
    createTask('implement', 'coding', 'Implement the required changes', ['analyze']),
    createTask('test', 'test', 'Create and run tests', ['implement']),
    createTask('review', 'review', 'Review code and check for issues', ['implement']),
    createTask('docs', 'docs', 'Update documentation', ['implement']),
  ];

  // Execute workflow
  await trackTaskExecution('coding_workflow', async () => {
    const results = await coordinator.orchestrateWorkflow(tasks);
    console.log('[AgentSystem] Coding workflow completed:', results);
  });
}

/**
 * Example: Run GitHub integration workflow
 */
export async function runGitHubIntegration(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<void> {
  console.log('[AgentSystem] Starting GitHub integration...');

  // Create coding agent
  const client = await AgentFactory.createAgent('coding');
  const githubAgent = new GitHubCodingAgent(client, owner, repo);

  // Handle issue (placeholder data)
  const issue = {
    number: issueNumber,
    title: 'Example Issue',
    body: 'Issue description',
    labels: ['bug'],
    assignees: ['agent'],
    state: 'open' as const,
  };

  await trackTaskExecution('github_integration', async () => {
    const pr = await githubAgent.handleIssue(issue);
    console.log('[AgentSystem] Created PR:', pr);
  });
}

/**
 * Get system metrics
 */
export function getSystemMetrics(): any {
  return agentMetrics.getAllMetrics();
}

/**
 * Cleanup and shutdown
 */
export async function shutdown(coordinator: AgentCoordinator): Promise<void> {
  console.log('[AgentSystem] Shutting down agent system...');
  await coordinator.cleanup();
  console.log('[AgentSystem] Agent system shut down successfully');
}

// Export all components for external use
export { AgentCoordinator, createTask } from './orchestrator/coordinator';
export { GitHubCodingAgent } from './integrations/github-agent';
export { AgentFactory } from './core/agent-factory';
export * from './types';
export * from './hooks/security-hooks';
