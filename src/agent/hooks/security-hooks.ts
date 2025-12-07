/**
 * Security Hooks for Agent Tool Execution
 * Implements pre and post execution validation and audit logging
 */

import { HookContext } from '../types';

/**
 * Dangerous command patterns to block
 */
const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+\//,
  /sudo\s+/,
  /curl.*\|\s*bash/,
  /wget.*\|\s*sh/,
  />\s*\/etc\//,
  /chmod\s+777/,
  /chown\s+root/,
  /dd\s+if=/,
  /mkfs\./,
  /:\(\)\{\s*:\|:&\s*\};:/, // Fork bomb
];

/**
 * Protected file paths
 */
const PROTECTED_PATHS = [
  '.env',
  'secrets',
  'credentials',
  '.git/config',
  'id_rsa',
  'id_ed25519',
  'authorized_keys',
  'shadow',
  'passwd',
];

/**
 * Hook result interface
 */
interface HookResult {
  hookSpecificOutput?: {
    hookEventName: string;
    permissionDecision?: 'allow' | 'deny';
    permissionDecisionReason?: string;
  };
}

/**
 * Pre-execution validation hook
 * Validates tool execution requests before they are executed
 */
export async function validateToolExecution(
  input: Record<string, unknown>,
  toolUseId: string | null,
  context: HookContext
): Promise<HookResult> {
  const toolName = input.tool_name as string;
  const toolInput = input.tool_input as Record<string, unknown>;

  // Block dangerous bash commands
  if (toolName === 'Bash' || toolName === 'bash') {
    const command = toolInput.command as string;

    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        return {
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: `Blocked dangerous command pattern: ${pattern.source}`,
          },
        };
      }
    }

    // Block commands that try to access sensitive files
    for (const protectedPath of PROTECTED_PATHS) {
      if (command.includes(protectedPath)) {
        return {
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: `Command attempts to access protected path: ${protectedPath}`,
          },
        };
      }
    }
  }

  // Validate file write operations
  if (['Write', 'Edit', 'write', 'edit'].includes(toolName)) {
    const filePath = (toolInput.file_path || toolInput.path) as string;

    if (filePath) {
      for (const protectedPath of PROTECTED_PATHS) {
        if (filePath.includes(protectedPath)) {
          return {
            hookSpecificOutput: {
              hookEventName: 'PreToolUse',
              permissionDecision: 'deny',
              permissionDecisionReason: `Cannot write to protected path: ${protectedPath}`,
            },
          };
        }
      }
    }
  }

  // Validate network operations
  if (toolName === 'HttpRequest' || toolName === 'http_request') {
    const url = (toolInput.url || toolInput.uri) as string;

    if (url) {
      // Block requests to localhost/internal IPs (SSRF protection)
      const internalPatterns = [
        /localhost/i,
        /127\.0\.0\./,
        /192\.168\./,
        /10\.\d+\./,
        /172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /169\.254\./, // AWS metadata endpoint
      ];

      for (const pattern of internalPatterns) {
        if (pattern.test(url)) {
          return {
            hookSpecificOutput: {
              hookEventName: 'PreToolUse',
              permissionDecision: 'deny',
              permissionDecisionReason: 'Blocked request to internal/private IP address',
            },
          };
        }
      }
    }
  }

  // Allow execution by default
  return {};
}

/**
 * Audit log entry interface
 */
interface AuditLogEntry {
  timestamp: string;
  toolName: string;
  toolUseId: string | null;
  sessionId: string;
  userId?: string;
  agentType: string;
  input: unknown;
  result?: 'success' | 'error' | 'denied';
}

// In-memory audit log (in production, use persistent storage)
const auditLogs: AuditLogEntry[] = [];

/**
 * Sanitize input for logging (remove sensitive data)
 */
function sanitizeForLogging(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  const sanitized = { ...(input as Record<string, unknown>) };
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey', 'api_key'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Audit logging hook
 * Logs all tool executions for compliance and debugging
 */
export async function auditToolExecution(
  input: Record<string, unknown>,
  toolUseId: string | null,
  context: HookContext
): Promise<HookResult> {
  const auditLog: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    toolName: input.tool_name as string,
    toolUseId,
    sessionId: context.sessionId,
    userId: context.userId,
    agentType: context.agentType,
    input: sanitizeForLogging(input.tool_input),
  };

  auditLogs.push(auditLog);

  // In production, write to persistent storage
  // await writeAuditLog(auditLog);

  return {};
}

/**
 * Post-execution hook
 * Logs execution results
 */
export async function logToolResult(
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  toolUseId: string | null,
  context: HookContext
): Promise<HookResult> {
  const logEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    toolName: input.tool_name as string,
    toolUseId,
    sessionId: context.sessionId,
    userId: context.userId,
    agentType: context.agentType,
    input: sanitizeForLogging(input.tool_input),
    result: output.is_error ? 'error' : 'success',
  };

  auditLogs.push(logEntry);

  return {};
}

/**
 * Get audit logs (for debugging/compliance)
 */
export function getAuditLogs(filters?: {
  sessionId?: string;
  userId?: string;
  agentType?: string;
  startTime?: Date;
  endTime?: Date;
}): AuditLogEntry[] {
  if (!filters) {
    return [...auditLogs];
  }

  return auditLogs.filter((log) => {
    if (filters.sessionId && log.sessionId !== filters.sessionId) return false;
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.agentType && log.agentType !== filters.agentType) return false;
    if (filters.startTime && new Date(log.timestamp) < filters.startTime) return false;
    if (filters.endTime && new Date(log.timestamp) > filters.endTime) return false;
    return true;
  });
}

/**
 * Clear audit logs (for testing)
 */
export function clearAuditLogs(): void {
  auditLogs.length = 0;
}
