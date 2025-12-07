/**
 * Participant Type - VIP Experience Participants
 *
 * Used for realtime participation display and notifications.
 */

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  participatedAt?: string;
}

export interface ParticipantWithExperience extends Participant {
  experienceId: string;
  experienceTitle?: string;
}
