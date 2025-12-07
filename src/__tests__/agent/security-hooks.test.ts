/**
 * Tests for Security Hooks
 */

import { describe, it, expect } from 'vitest';
import { validateToolExecution, clearAuditLogs } from '../../agent/hooks/security-hooks';

describe('Security Hooks', () => {
  const mockContext = {
    sessionId: 'test-session',
    userId: 'test-user',
    agentType: 'coding' as const,
  };

  it('should block dangerous rm -rf command', async () => {
    const input = {
      tool_name: 'bash',
      tool_input: {
        command: 'rm -rf /',
      },
    };

    const result = await validateToolExecution(input, 'test-id', mockContext);

    expect(result.hookSpecificOutput?.permissionDecision).toBe('deny');
    expect(result.hookSpecificOutput?.permissionDecisionReason).toContain('dangerous');
  });

  it('should block sudo commands', async () => {
    const input = {
      tool_name: 'bash',
      tool_input: {
        command: 'sudo rm file.txt',
      },
    };

    const result = await validateToolExecution(input, 'test-id', mockContext);

    expect(result.hookSpecificOutput?.permissionDecision).toBe('deny');
  });

  it('should block write to .env file', async () => {
    const input = {
      tool_name: 'write',
      tool_input: {
        file_path: '/app/.env',
      },
    };

    const result = await validateToolExecution(input, 'test-id', mockContext);

    expect(result.hookSpecificOutput?.permissionDecision).toBe('deny');
    expect(result.hookSpecificOutput?.permissionDecisionReason).toContain('protected');
  });

  it('should allow safe commands', async () => {
    const input = {
      tool_name: 'bash',
      tool_input: {
        command: 'ls -la',
      },
    };

    const result = await validateToolExecution(input, 'test-id', mockContext);

    expect(result.hookSpecificOutput?.permissionDecision).not.toBe('deny');
  });

  it('should block access to internal IPs (SSRF protection)', async () => {
    const input = {
      tool_name: 'http_request',
      tool_input: {
        url: 'http://localhost:8080/admin',
      },
    };

    const result = await validateToolExecution(input, 'test-id', mockContext);

    expect(result.hookSpecificOutput?.permissionDecision).toBe('deny');
    expect(result.hookSpecificOutput?.permissionDecisionReason).toContain('internal');
  });
});
