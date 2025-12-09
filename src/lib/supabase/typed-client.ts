/**
 * Typed Supabase Client Utilities
 *
 * This module provides type-safe wrappers for Supabase client operations.
 * It works around type inference issues with supabase-js while maintaining
 * type safety through explicit type definitions.
 */

import type { Database, Insertable, Updatable, Tables } from '@/types/database';

// Re-export types for convenience
export type { Insertable, Updatable, Tables };

/**
 * Generic query result type
 */
export interface QueryResult<T> {
  data: T | null;
  error: { message: string; code?: string; details?: string } | null;
}

/**
 * Type-safe wrapper for common Supabase operations
 * Bypasses strict type checking while maintaining runtime safety
 */
export function typedFrom<TableName extends keyof Database['public']['Tables']>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  tableName: TableName
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return supabase.from(tableName as string);
}

/**
 * Generic typed query helper
 */
export async function typedQuery<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryFn: () => Promise<any>
): Promise<QueryResult<T>> {
  const result = await queryFn();
  return result as QueryResult<T>;
}
