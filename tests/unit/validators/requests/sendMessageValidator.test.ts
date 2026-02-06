import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessageValidator } from '../../../../src/validators/requests/sendMessageValidator';
import type { Request, Response, NextFunction } from 'express';

describe('sendMessageValidator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  it('should call next() when valid message content is provided', () => {
    mockRequest.body = {
      content: 'Hello! Is the cat still available?'
    };

    sendMessageValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 when content is missing', () => {
    mockRequest.body = {};

    sendMessageValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid message data'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when content is empty string', () => {
    mockRequest.body = {
      content: ''
    };

    sendMessageValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid message data'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when content exceeds 5000 characters', () => {
    mockRequest.body = {
      content: 'a'.repeat(5001)
    };

    sendMessageValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid message data'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() when content is exactly 5000 characters', () => {
    mockRequest.body = {
      content: 'a'.repeat(5000)
    };

    sendMessageValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 500 when an unexpected error occurs', () => {
    const errorRequest = {
      get body() {
        throw new Error('Unexpected error');
      }
    };

    sendMessageValidator(
      errorRequest as Request,
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
