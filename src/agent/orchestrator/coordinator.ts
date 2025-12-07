/**
 * Agent Coordinator for Multi-Agent Orchestration
 * Manages task delegation, dependencies, and workflow execution
 */

import { AgentFactory } from '../core/agent-factory';
import { Task, AgentType, AgentMessage } from '../types';

/**
 * Agent Coordinator Class
 * Orchestrates multiple specialized agents to complete complex workflows
 */
export class AgentCoordinator {
  private agents: Map<AgentType, any> = new Map();
  private taskQueue: Task[] = [];
  private taskResults: Map<string, unknown> = new Map();

  /**
   * Initialize all specialized agents
   */
  async initialize(): Promise<void> {
    const agentTypes: AgentType[] = ['coordinator', 'coding', 'test', 'review', 'docs', 'deploy'];

    for (const type of agentTypes) {
      try {
        const agent = await AgentFactory.createAgent(type);
        this.agents.set(type, agent);
        console.log(`[Coordinator] Initialized ${type} agent`);
      } catch (error) {
        console.error(`[Coordinator] Failed to initialize ${type} agent:`, error);
      }
    }
  }

  /**
   * Execute a single task
   */
  async executeTask(task: Task): Promise<unknown> {
    const agent = this.agents.get(task.type);
    if (!agent) {
      throw new Error(`No agent available for task type: ${task.type}`);
    }

    console.log(`[Coordinator] Executing task ${task.id} (${task.type})`);
    task.status = 'running';

    try {
      // Build task prompt with context
      const prompt = this.buildTaskPrompt(task);

      // Send task to specialized agent
      await agent.query(prompt);

      // Collect response
      let result = '';
      for await (const message of agent.receive_response()) {
        if (this.isAssistantMessage(message)) {
          for (const block of message.content) {
            if (block.type === 'text' && block.text) {
              result += block.text;
            }
          }
        }
      }

      task.status = 'completed';
      task.result = result;

      console.log(`[Coordinator] Task ${task.id} completed successfully`);
      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error : new Error(String(error));
      console.error(`[Coordinator] Task ${task.id} failed:`, error);
      throw error;
    }
  }

  /**
   * Orchestrate a workflow with multiple dependent tasks
   */
  async orchestrateWorkflow(workflow: Task[]): Promise<Map<string, unknown>> {
    console.log(`[Coordinator] Starting workflow with ${workflow.length} tasks`);

    const results = new Map<string, unknown>();
    const pending = [...workflow];
    let iteration = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (pending.length > 0 && iteration < maxIterations) {
      iteration++;

      // Find tasks with satisfied dependencies
      const ready = pending.filter((task) => task.dependencies.every((dep) => results.has(dep)));

      if (ready.length === 0 && pending.length > 0) {
        const unsatisfiedTasks = pending.map((t) => ({
          id: t.id,
          dependencies: t.dependencies,
          missing: t.dependencies.filter((d) => !results.has(d)),
        }));
        throw new Error(
          `Circular dependency or missing tasks detected: ${JSON.stringify(unsatisfiedTasks)}`
        );
      }

      console.log(`[Coordinator] Iteration ${iteration}: ${ready.length} tasks ready`);

      // Execute ready tasks in parallel
      const executions = ready.map(async (task) => {
        try {
          const result = await this.executeTask(task);
          results.set(task.id, result);

          // Remove from pending
          const index = pending.indexOf(task);
          if (index > -1) {
            pending.splice(index, 1);
          }
        } catch (error) {
          console.error(`[Coordinator] Task ${task.id} failed in workflow:`, error);
          throw error;
        }
      });

      await Promise.all(executions);
    }

    if (pending.length > 0) {
      throw new Error(
        `Workflow did not complete: ${pending.length} tasks remaining after ${maxIterations} iterations`
      );
    }

    console.log(`[Coordinator] Workflow completed successfully`);
    return results;
  }

  /**
   * Add task to queue
   */
  addTask(task: Task): void {
    this.taskQueue.push(task);
    console.log(`[Coordinator] Added task ${task.id} to queue`);
  }

  /**
   * Process all queued tasks
   */
  async processQueue(): Promise<Map<string, unknown>> {
    const tasks = [...this.taskQueue];
    this.taskQueue = [];
    return this.orchestrateWorkflow(tasks);
  }

  /**
   * Build task prompt with context
   */
  private buildTaskPrompt(task: Task): string {
    let prompt = `## Task: ${task.description}\n\n`;
    prompt += `Task ID: ${task.id}\n`;
    prompt += `Type: ${task.type}\n\n`;

    // Include results from dependencies
    if (task.dependencies.length > 0) {
      prompt += `## Context from Previous Tasks:\n\n`;
      for (const depId of task.dependencies) {
        const depResult = this.taskResults.get(depId);
        if (depResult) {
          prompt += `### ${depId}:\n${JSON.stringify(depResult, null, 2)}\n\n`;
        }
      }
    }

    prompt += `Please complete this task and provide a detailed response.\n`;

    return prompt;
  }

  /**
   * Type guard for assistant messages
   */
  private isAssistantMessage(message: any): message is AgentMessage {
    return message && message.type === 'assistant' && Array.isArray(message.content);
  }

  /**
   * Get agent status
   */
  getStatus(): {
    initializedAgents: AgentType[];
    queuedTasks: number;
    completedTasks: number;
  } {
    return {
      initializedAgents: Array.from(this.agents.keys()),
      queuedTasks: this.taskQueue.length,
      completedTasks: this.taskResults.size,
    };
  }

  /**
   * Cleanup and disconnect all agents
   */
  async cleanup(): Promise<void> {
    console.log('[Coordinator] Cleaning up agents...');
    await AgentFactory.cleanup();
    this.agents.clear();
    this.taskQueue = [];
    this.taskResults.clear();
  }
}

/**
 * Create a task
 */
export function createTask(
  id: string,
  type: AgentType,
  description: string,
  dependencies: string[] = []
): Task {
  return {
    id,
    type,
    description,
    dependencies,
    status: 'pending',
  };
}
