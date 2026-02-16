import HttpResponseError from '../../../src/dtos/httpResponseError';

describe('HttpResponseError', () => {
  it('should create an error with status code and message', () => {
    const error = new HttpResponseError(404, 'Resource not found');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpResponseError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('should create an error with 400 status code', () => {
    const error = new HttpResponseError(400, 'Bad request');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
  });

  it('should create an error with 500 status code', () => {
    const error = new HttpResponseError(500, 'Internal server error');

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Internal server error');
  });

  it('should be throwable and catchable', () => {
    try {
      throw new HttpResponseError(403, 'Forbidden');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpResponseError);
      expect((error as HttpResponseError).statusCode).toBe(403);
      expect((error as HttpResponseError).message).toBe('Forbidden');
    }
  });

  it('should have correct prototype chain', () => {
    const error = new HttpResponseError(409, 'Conflict');

    expect(Object.getPrototypeOf(error)).toBe(HttpResponseError.prototype);
    expect(error instanceof Error).toBe(true);
  });
});
