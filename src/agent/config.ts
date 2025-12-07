/**
 * Agent System Configuration
 * Central configuration for all agent system settings
 */

export interface AgentSystemConfig {
  // API Configuration
  anthropic: {
    apiKey: string;
    model: string;
    maxTurns: number;
    timeout: number;
  };

  // GitHub Configuration
  github: {
    token: string;
    owner?: string;
    repo?: string;
    baseBranch: string;
  };

  // Security Configuration
  security: {
    enableHooks: boolean;
    enableAuditLogging: boolean;
    maxCommandLength: number;
    allowedTools?: string[];
    blockedPatterns?: RegExp[];
  };

  // Observability Configuration
  observability: {
    enableTracing: boolean;
    enableMetrics: boolean;
    metricsPort: number;
  };

  // MCP Server Configuration
  mcpServers: {
    enabled: string[];
    timeout: number;
  };

  // Workflow Configuration
  workflow: {
    maxParallelTasks: number;
    taskTimeout: number;
    retryAttempts: number;
  };
}

/**
 * Default configuration
 */
export const defaultConfig: AgentSystemConfig = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-5-20251101',
    maxTurns: 50,
    timeout: 300000, // 5 minutes
  },

  github: {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    baseBranch: 'main',
  },

  security: {
    enableHooks: true,
    enableAuditLogging: true,
    maxCommandLength: 10000,
    allowedTools: undefined, // undefined = allow all
    blockedPatterns: undefined, // Use defaults from security-hooks.ts
  },

  observability: {
    enableTracing: true,
    enableMetrics: true,
    metricsPort: 8080,
  },

  mcpServers: {
    enabled: ['github', 'filesystem', 'memory'],
    timeout: 30000, // 30 seconds
  },

  workflow: {
    maxParallelTasks: 5,
    taskTimeout: 600000, // 10 minutes
    retryAttempts: 3,
  },
};

/**
 * Load configuration from environment or use defaults
 */
export function loadConfig(overrides?: Partial<AgentSystemConfig>): AgentSystemConfig {
  const config: AgentSystemConfig = {
    ...defaultConfig,
    ...overrides,
  };

  // Validate required configuration
  if (!config.anthropic.apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required');
  }

  return config;
}

/**
 * Get configuration value by path
 */
export function getConfigValue<T>(config: AgentSystemConfig, path: string): T | undefined {
  const keys = path.split('.');
  let value: any = config;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value as T;
}

/**
 * Validate configuration
 */
export function validateConfig(config: AgentSystemConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!config.anthropic.apiKey) {
    errors.push('anthropic.apiKey is required');
  }

  if (config.anthropic.maxTurns < 1) {
    errors.push('anthropic.maxTurns must be at least 1');
  }

  if (config.workflow.maxParallelTasks < 1) {
    errors.push('workflow.maxParallelTasks must be at least 1');
  }

  if (config.security.maxCommandLength < 100) {
    errors.push('security.maxCommandLength must be at least 100');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create production configuration
 */
export function createProductionConfig(): AgentSystemConfig {
  return loadConfig({
    anthropic: {
      ...defaultConfig.anthropic,
      timeout: 600000, // 10 minutes in production
    },
    workflow: {
      ...defaultConfig.workflow,
      maxParallelTasks: 10,
      taskTimeout: 1200000, // 20 minutes in production
    },
    observability: {
      enableTracing: true,
      enableMetrics: true,
      metricsPort: 8080,
    },
  });
}

/**
 * Create development configuration
 */
export function createDevelopmentConfig(): AgentSystemConfig {
  return loadConfig({
    security: {
      ...defaultConfig.security,
      enableAuditLogging: true,
    },
    observability: {
      enableTracing: true,
      enableMetrics: true,
      metricsPort: 8080,
    },
  });
}
