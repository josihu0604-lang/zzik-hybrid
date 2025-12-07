/**
 * Agent Factory for Creating Production AI Coding Agents
 * Implements best practices for agent instantiation and configuration
 */

import { AgentType, AgentConfig, McpServerConfig } from '../types';

/**
 * Production-ready agent factory using best practices
 * Note: This is a placeholder implementation for the Claude Agent SDK
 * In production, use @anthropic-ai/claude-agent-sdk
 */
export class AgentFactory {
  private static instances: Map<string, any> = new Map();

  /**
   * Create a specialized agent with appropriate tools and configuration
   */
  static async createAgent(type: AgentType, options?: Partial<AgentConfig>): Promise<any> {
    const agentKey = `${type}-${Date.now()}`;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    const baseOptions = this.getBaseOptions(type);
    const mergedOptions = { ...baseOptions, ...options };

    // In production, instantiate with:
    // const client = new ClaudeSDKClient(mergedOptions);
    // await client.connect();

    const client = {
      type,
      config: mergedOptions,
      connected: true,
      query: async (prompt: string) => {
        console.log(`[${type}] Query:`, prompt);
      },
      receive_response: async function* () {
        yield {
          type: 'assistant',
          content: [{ type: 'text', text: 'Response placeholder' }],
        };
      },
    };

    this.instances.set(agentKey, client);
    return client;
  }

  /**
   * Get base configuration for each agent type
   */
  private static getBaseOptions(type: AgentType): AgentConfig {
    return {
      model: 'claude-sonnet-4-5-20251101',
      maxTurns: 50,
      permissionMode: 'default',
      mcpServers: this.getMcpServersForAgent(type),
      allowedTools: this.getAllowedToolsForAgent(type),
      systemPrompt: this.getSystemPromptForAgent(type),
    };
  }

  /**
   * Get MCP servers appropriate for each agent type
   */
  private static getMcpServersForAgent(type: AgentType): Record<string, McpServerConfig> {
    const commonServers: Record<string, McpServerConfig> = {
      memory: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
      },
    };

    const typeSpecificServers: Record<AgentType, Record<string, McpServerConfig>> = {
      coordinator: {
        ...commonServers,
      },
      coding: {
        ...commonServers,
        github: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-github'],
          env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN || '' },
        },
        filesystem: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace'],
        },
      },
      test: {
        ...commonServers,
        filesystem: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace'],
        },
      },
      review: {
        ...commonServers,
        github: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-github'],
          env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN || '' },
        },
      },
      docs: {
        ...commonServers,
        filesystem: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace'],
        },
      },
      deploy: {
        ...commonServers,
        github: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-github'],
          env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN || '' },
        },
      },
    };

    return typeSpecificServers[type];
  }

  /**
   * Get allowed tools for each agent type
   */
  private static getAllowedToolsForAgent(type: AgentType): string[] {
    const allowedTools: Record<AgentType, string[]> = {
      coordinator: ['memory', 'router'],
      coding: ['file', 'github', 'lsp', 'bash'],
      test: ['test_runner', 'coverage', 'file'],
      review: ['static_analysis', 'github', 'security_scan'],
      docs: ['markdown', 'diagram', 'file'],
      deploy: ['github_actions', 'docker', 'kubernetes'],
    };

    return allowedTools[type];
  }

  /**
   * Get system prompt for each agent type
   */
  private static getSystemPromptForAgent(type: AgentType): string {
    const systemPrompts: Record<AgentType, string> = {
      coordinator: `You are a Coordinator Agent responsible for orchestrating tasks across specialized agents.
Your role:
- Analyze complex tasks and break them into subtasks
- Delegate to appropriate specialized agents
- Manage task dependencies and execution order
- Ensure overall workflow success

Always think step-by-step and coordinate efficiently.`,

      coding: `You are a Coding Agent specialized in generating and editing code.
Your role:
- Write clean, maintainable, and well-documented code
- Follow existing code patterns and style guides
- Implement features based on requirements
- Refactor code for better quality

Focus on code quality and best practices.`,

      test: `You are a Test Agent specialized in creating and running tests.
Your role:
- Generate comprehensive test cases
- Execute tests and analyze results
- Calculate and improve code coverage
- Identify edge cases and regression risks

Ensure high test quality and coverage.`,

      review: `You are a Review Agent specialized in code review and security analysis.
Your role:
- Perform thorough code reviews
- Identify security vulnerabilities
- Suggest improvements and optimizations
- Ensure code quality standards

Be thorough and constructive in reviews.`,

      docs: `You are a Documentation Agent specialized in creating technical documentation.
Your role:
- Generate clear, comprehensive documentation
- Create diagrams and visual aids
- Write API documentation and guides
- Keep documentation up-to-date

Make documentation accessible and useful.`,

      deploy: `You are a Deploy Agent specialized in CI/CD and deployment.
Your role:
- Manage deployment pipelines
- Configure CI/CD workflows
- Handle containerization and orchestration
- Ensure smooth deployments

Focus on reliability and automation.`,
    };

    return systemPrompts[type];
  }

  /**
   * Get an existing agent instance
   */
  static getInstance(key: string): any | undefined {
    return this.instances.get(key);
  }

  /**
   * Disconnect and cleanup all agent instances
   */
  static async cleanup(): Promise<void> {
    const entries = Array.from(this.instances.entries());
    for (const [key, client] of entries) {
      if (client.disconnect) {
        await client.disconnect();
      }
      this.instances.delete(key);
    }
  }
}
