/**
 * Tests for Agent Factory
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentFactory } from '../../agent/core/agent-factory';

describe('AgentFactory', () => {
  beforeEach(() => {
    // Set mock API key for testing
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  afterEach(async () => {
    // Cleanup after each test
    await AgentFactory.cleanup();
  });

  it('should create a coding agent', async () => {
    const agent = await AgentFactory.createAgent('coding');

    expect(agent).toBeDefined();
    expect(agent.type).toBe('coding');
    expect(agent.config).toBeDefined();
    expect(agent.connected).toBe(true);
  });

  it('should create a test agent', async () => {
    const agent = await AgentFactory.createAgent('test');

    expect(agent).toBeDefined();
    expect(agent.type).toBe('test');
  });

  it('should throw error without API key', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    await expect(AgentFactory.createAgent('coding')).rejects.toThrow(
      'ANTHROPIC_API_KEY environment variable is required'
    );
  });
});
