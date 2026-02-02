import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import config from '../config/config';
import * as schema from '../database-migrations/schema';
import * as relations from '../database-migrations/relations';

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(config.DATABASE_URL, { prepare: false });
export const db = drizzle({ client, schema: { ...schema, ...relations } });
