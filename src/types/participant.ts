/**
 * Participant Type Definitions
 *
 * Shared participant types for realtime features
 */

/**
 * Participant data from realtime subscriptions
 */
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  joinedAt?: Date;
}

/**
 * Simplified participant for display
 */
export interface ParticipantDisplay {
  name: string;
  timestamp: number;
}

/**
 * Convert Participant to ParticipantDisplay
 */
export function toParticipantDisplay(p: Participant): ParticipantDisplay {
  return {
    name: p.name,
    timestamp: p.joinedAt?.getTime() ?? Date.now(),
  };
}

/**
 * Convert ParticipantDisplay to Participant
 */
export function toParticipant(p: ParticipantDisplay): Participant {
  return {
    id: `p_${p.timestamp}`,
    name: p.name,
    joinedAt: new Date(p.timestamp),
  };
}
