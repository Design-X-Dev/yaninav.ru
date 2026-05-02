import * as migration_20260502_082625_baseline from './20260502_082625_baseline';

export const migrations = [
  {
    up: migration_20260502_082625_baseline.up,
    down: migration_20260502_082625_baseline.down,
    name: '20260502_082625_baseline'
  },
];
