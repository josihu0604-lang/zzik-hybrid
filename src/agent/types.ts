/**
 * Agent Types for ZZIK Production AI Coding Agent System
 * Based on MCP v1.0 (2025-06-18 spec)
 */

export type AgentType = 'coordinator' | 'coding' | 'test' | 'review' | 'docs' | 'deploy';

export interface AgentConfig {
  model: string;
  maxTurns: number;
  permissionMode: 'default' | 'strict' | 'permissive';
  mcpServers: Record<string, McpServerConfig>;
  allowedTools?: string[];
  systemPrompt: string;
}

export interface McpServerConfig {
  type: 'stdio' | 'http';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
}

export interface Task {
  id: string;
  type: AgentType;
  description: string;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  error?: Error;
}

export interface AgentMessage {
  type: 'assistant' | 'user' | 'tool';
  content: Array<{
    type: 'text' | 'tool_use' | 'tool_result';
    text?: string;
    tool_name?: string;
    tool_input?: Record<string, unknown>;
    tool_use_id?: string;
    content?: unknown;
  }>;
}

export interface HookContext {
  sessionId: string;
  userId?: string;
  agentType: AgentType;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  is_error?: boolean;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
  state: 'open' | 'closed';
}

export interface PullRequest {
  number: number;
  title: string;
  body: string;
  head: string;
  base: string;
  state: 'open' | 'closed' | 'merged';
  draft: boolean;
}

export interface ReviewComment {
  id: number;
  path: string;
  line: number;
  body: string;
  user: string;
}
