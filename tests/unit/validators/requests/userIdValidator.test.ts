import type { Request, Response, NextFunction } from 'express';

// Mock supabase before importing
vi.mock('../../../../src/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    }
  }
}));

import userIdValidator from '../../../../src/validators/requests/userIdValidator';
import { supabase } from '../../../../src/utils/supabaseClient';

describe('userIdValidator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      headers: {}
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call next() when userId matches authenticated user', async () => {
    const userId = 'test-user-id';
    mockRequest.params = { userId };
    mockRequest.headers = { authorization: 'Bearer valid-token' };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: userId,
          aud: 'authenticated',
          email: 'test@example.com'
        } as any
      },
      error: null
    });

    await userIdValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 when userId is empty string', async () => {
    mockRequest.params = { userId: '' };
    mockRequest.headers = { authorization: 'Bearer token' };

    await userIdValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid user ID'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when userId does not match authenticated user', async () => {
    mockRequest.params = { userId: 'user-1' };
    mockRequest.headers = { authorization: 'Bearer valid-token' };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: 'user-2',
          aud: 'authenticated',
          email: 'test@example.com'
        } as any
      },
      error: null
    });

    await userIdValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Insufficient access'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not authenticated', async () => {
    mockRequest.params = { userId: 'test-user-id' };
    mockRequest.headers = { authorization: 'Bearer invalid-token' };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' } as any
    });

    await userIdValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Insufficient access'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 500 when an error occurs', async () => {
    mockRequest.params = { userId: 'test-user-id' };
    mockRequest.headers = { authorization: 'Bearer token' };

    vi.mocked(supabase.auth.getUser).mockRejectedValue(
      new Error('Database error')
    );

    await userIdValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
