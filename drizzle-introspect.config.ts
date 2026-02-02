import config from './src/config/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/database-migrations',
  dialect: 'postgresql',
  schemaFilter: ['public', 'auth'],
  tablesFilter: ['auth.users', 'public.*'],
  extensionsFilters: ['postgis'],
  dbCredentials: {
    url: config.DATABASE_INTROSPECT_URL
  },
  verbose: true
});
