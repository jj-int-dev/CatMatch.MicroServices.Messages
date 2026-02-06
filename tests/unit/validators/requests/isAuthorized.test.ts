import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

// Mock supabase before importing
vi.mock('../../../../src/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    }
  }
}));

import isAuthorized from '../../../../src/validators/requests/isAuthorized';
import { supabase } from '../../../../src/utils/supabaseClient';

describe('isAuthorized', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
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

  it('should call next() when valid access and refresh tokens are provided', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-access-token',
      'refresh-token': 'valid-refresh-token'
    };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
          aud: 'authenticated',
          email: 'test@example.com'
        } as any
      },
      error: null
    });

    await isAuthorized(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header is missing', async () => {
    mockRequest.headers = {
      'refresh-token': 'valid-refresh-token'
    };

    await isAuthorized(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Unauthorized request'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when refresh token is missing', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-access-token'
    };

    await isAuthorized(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Unauthorized request'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when user data retrieval fails', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
      'refresh-token': 'valid-refresh-token'
    };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' } as any
    });

    await isAuthorized(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Unauthorized request'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when user aud is not authenticated', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-access-token',
      'refresh-token': 'valid-refresh-token'
    };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
          aud: 'not-authenticated',
          email: 'test@example.com'
        } as any
      },
      error: null
    });

    await isAuthorized(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Unauthorized request'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 500 when an unexpected error occurs', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-access-token',
      'refresh-token': 'valid-refresh-token'
    };

    vi.mocked(supabase.auth.getUser).mockRejectedValue(
      new Error('Unexpected error')
    );

    await isAuthorized(
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
