/**
 * MCP Server Registry for ZZIK Production Agent System
 * Centralizes all MCP server configurations
 */

import { McpServerConfig } from '../agent/types';

/**
 * Registry of all available MCP servers
 */
export const mcpServers: Record<string, McpServerConfig> = {
  // Core Development Servers
  github: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    },
  },

  filesystem: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace'],
  },

  // Database & Memory
  postgres: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    env: {
      DATABASE_URL: process.env.DATABASE_URL || '',
    },
  },

  memory: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
  },

  // Web & Search
  brave_search: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@anthropic/mcp-server-brave-search'],
    env: {
      BRAVE_API_KEY: process.env.BRAVE_API_KEY || '',
    },
  },

  puppeteer: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
  },

  // Communication
  slack: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    env: {
      SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
    },
  },
};

/**
 * Get server configuration by name
 */
export function getServerConfig(serverName: string): McpServerConfig | undefined {
  return mcpServers[serverName];
}

/**
 * Get all server configurations for a specific type
 */
export function getServersByType(type: 'stdio' | 'http'): Record<string, McpServerConfig> {
  return Object.entries(mcpServers)
    .filter(([_, config]) => config.type === type)
    .reduce(
      (acc, [name, config]) => {
        acc[name] = config;
        return acc;
      },
      {} as Record<string, McpServerConfig>
    );
}

/**
 * Validate server configuration
 */
export function validateServerConfig(config: McpServerConfig): boolean {
  if (config.type === 'stdio') {
    return !!(config.command && config.args);
  } else if (config.type === 'http') {
    return !!config.url;
  }
  return false;
}
