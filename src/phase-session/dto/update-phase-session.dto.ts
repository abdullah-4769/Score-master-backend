export class UpdatePhaseSessionDto {
  status?: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  elapsedTime?: number;
  startedAt?: Date;
  pausedAt?: Date;
  endedAt?: Date;
}
