export class PhaseSession {
  id: number;

  // Reference to Session
  sessionId: number;

  // Reference to Phase
  phaseId: number;

  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  timeDuration: number; // in seconds
  elapsedTime: number;

  startedAt?: Date;
  pausedAt?: Date;
  endedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
