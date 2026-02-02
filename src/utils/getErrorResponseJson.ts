import type { Response } from 'express';
import HttpResponseError from '../dtos/httpResponseError';

export default function (error: unknown, res: Response) {
  if (error instanceof HttpResponseError)
    return res.status(error.statusCode).json({ error: error.message });
  return res.status(500).json({ error: (error as Error).message });
}
