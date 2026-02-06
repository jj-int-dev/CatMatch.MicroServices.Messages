import { vi } from 'vitest';

export const mockSupabaseAuth = {
  getUser: vi.fn()
};

export const mockSupabase = {
  auth: mockSupabaseAuth
};

export function resetSupabaseMocks() {
  mockSupabaseAuth.getUser.mockClear();
}

// Common mock responses
export const mockAuthenticatedUser = {
  data: {
    user: {
      id: 'test-user-id',
      aud: 'authenticated',
      email: 'test@example.com'
    }
  },
  error: null
};

export const mockUnauthorizedUser = {
  data: { user: null },
  error: { message: 'Invalid token' }
};
