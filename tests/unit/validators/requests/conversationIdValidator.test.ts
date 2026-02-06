import { describe, it, expect, vi, beforeEach } from 'vitest';
import { conversationIdValidator } from '../../../../src/validators/requests/conversationIdValidator';
import type { Request, Response, NextFunction } from 'express';

describe('conversationIdValidator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {}
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  it('should call next() when valid conversationId is provided', () => {
    mockRequest.params = {
      conversationId: '123e4567-e89b-12d3-a456-426614174000'
    };

    conversationIdValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 when conversationId is not a valid UUID', () => {
    mockRequest.params = {
      conversationId: 'invalid-uuid'
    };

    conversationIdValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid conversation ID'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when conversationId is empty', () => {
    mockRequest.params = {
      conversationId: ''
    };

    conversationIdValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid conversation ID'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 500 when an unexpected error occurs', () => {
    const errorRequest = {
      get params() {
        throw new Error('Unexpected error');
      }
    };

    conversationIdValidator(
      errorRequest as unknown as Request,
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
