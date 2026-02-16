// Mock environment variables
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.DATABASE_INTROSPECT_URL =
  'postgresql://test:test@localhost:5432/test';
process.env.AUTHORIZED_CALLER = 'http://localhost:3000';
process.env.CACHE_URL = 'redis://localhost:6379';
process.env.CACHE_TOKEN = 'test-token';

// Suppress console logs during tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};
