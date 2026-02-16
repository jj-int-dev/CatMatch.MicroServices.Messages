import { createConversationValidator } from '../../../../src/validators/requests/createConversationValidator';
import type { Request, Response, NextFunction } from 'express';

describe('createConversationValidator', () => {
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

  it('should call next() when valid conversation data is provided', () => {
    mockRequest.body = {
      rehomerId: '123e4567-e89b-12d3-a456-426614174000',
      animalId: '987e6543-e21c-12d3-a456-426614174999'
    };

    createConversationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should call next() when only rehomerId is provided (animalId optional)', () => {
    mockRequest.body = {
      rehomerId: '123e4567-e89b-12d3-a456-426614174000'
    };

    createConversationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 when rehomerId is missing', () => {
    mockRequest.body = {};

    createConversationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid conversation data'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when rehomerId is not a valid UUID', () => {
    mockRequest.body = {
      rehomerId: 'invalid-uuid'
    };

    createConversationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid conversation data'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when animalId is not a valid UUID', () => {
    mockRequest.body = {
      rehomerId: '123e4567-e89b-12d3-a456-426614174000',
      animalId: 'invalid-uuid'
    };

    createConversationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid conversation data'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 500 when an unexpected error occurs', () => {
    // Mock a situation where next throws an error
    const errorRequest = {
      get body() {
        throw new Error('Unexpected error');
      }
    };

    createConversationValidator(
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
