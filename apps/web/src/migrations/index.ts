import * as migration_20260910_153453_initial_schema from './20260910_153453_initial_schema';
import * as migration_20260915_213808_add_featured_order from './20260915_213808_add_featured_order';

export const migrations = [
  {
    up: migration_20260910_153453_initial_schema.up,
    down: migration_20260910_153453_initial_schema.down,
    name: '20260910_153453_initial_schema',
  },
  {
    up: migration_20260915_213808_add_featured_order.up,
    down: migration_20260915_213808_add_featured_order.down,
    name: '20260915_213808_add_featured_order'
  },
];
