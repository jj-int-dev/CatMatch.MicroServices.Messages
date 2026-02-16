import { typingStatusValidator } from '../../../../src/validators/requests/typingStatusValidator';
import type { Request, Response, NextFunction } from 'express';

describe('typingStatusValidator', () => {
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

  it('should call next() when isTyping is true', () => {
    mockRequest.body = {
      isTyping: true
    };

    typingStatusValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should call next() when isTyping is false', () => {
    mockRequest.body = {
      isTyping: false
    };

    typingStatusValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 when isTyping is not a boolean', () => {
    mockRequest.body = {
      isTyping: 'true'
    };

    typingStatusValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'isTyping must be a boolean'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when isTyping is missing', () => {
    mockRequest.body = {};

    typingStatusValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'isTyping must be a boolean'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when isTyping is a number', () => {
    mockRequest.body = {
      isTyping: 1
    };

    typingStatusValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'isTyping must be a boolean'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
