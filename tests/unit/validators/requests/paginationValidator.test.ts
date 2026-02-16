import { paginationValidator } from '../../../../src/validators/requests/paginationValidator';
import type { Request, Response, NextFunction } from 'express';

describe('paginationValidator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {}
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  it('should call next() with default values when no query params provided', () => {
    mockRequest.query = {};

    paginationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.pagination).toEqual({ page: 1, pageSize: 20 });
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should call next() with valid pagination parameters', () => {
    mockRequest.query = {
      page: '2',
      pageSize: '50'
    };

    paginationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.pagination).toEqual({ page: 2, pageSize: 50 });
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 when page is less than 1', () => {
    mockRequest.query = {
      page: '0'
    };

    paginationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid pagination parameters'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when page is not a number', () => {
    mockRequest.query = {
      page: 'abc'
    };

    paginationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid pagination parameters'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when pageSize is less than 1', () => {
    mockRequest.query = {
      pageSize: '0'
    };

    paginationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid pagination parameters'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when pageSize is greater than 100', () => {
    mockRequest.query = {
      pageSize: '101'
    };

    paginationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid pagination parameters'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() when pageSize is exactly 100', () => {
    mockRequest.query = {
      pageSize: '100'
    };

    paginationValidator(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.pagination).toEqual({ page: 1, pageSize: 100 });
  });

  it('should return 500 when an unexpected error occurs', () => {
    const errorRequest = {
      get query() {
        throw new Error('Unexpected error');
      }
    };

    paginationValidator(
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
