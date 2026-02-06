import { describe, it, expect, vi, beforeEach } from 'vitest';
import getErrorResponseJson from '../../../src/utils/getErrorResponseJson';
import HttpResponseError from '../../../src/dtos/httpResponseError';
import type { Response } from 'express';

describe('getErrorResponseJson', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
  });

  it('should return 400 with message for HttpResponseError with 400 status', () => {
    const error = new HttpResponseError(400, 'Invalid request data');

    getErrorResponseJson(error, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid request data'
    });
  });

  it('should return 404 with message for HttpResponseError with 404 status', () => {
    const error = new HttpResponseError(404, 'Resource not found');

    getErrorResponseJson(error, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Resource not found'
    });
  });

  it('should return 409 with message for HttpResponseError with 409 status', () => {
    const error = new HttpResponseError(409, 'Resource already exists');

    getErrorResponseJson(error, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Resource already exists'
    });
  });

  it('should return 500 with message for generic Error', () => {
    const error = new Error('Database connection failed');

    getErrorResponseJson(error, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Database connection failed'
    });
  });

  it('should return 500 with unknown error message for non-Error objects', () => {
    const error = { message: 'String error' } as any;

    getErrorResponseJson(error, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'String error'
    });
  });

  it('should return 403 with message for HttpResponseError with 403 status', () => {
    const error = new HttpResponseError(403, 'Forbidden access');

    getErrorResponseJson(error, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Forbidden access'
    });
  });
});
