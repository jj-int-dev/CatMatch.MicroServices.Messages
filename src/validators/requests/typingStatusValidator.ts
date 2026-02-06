import type { Request, Response, NextFunction } from 'express';

export function typingStatusValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (typeof req.body.isTyping !== 'boolean') {
    return res.status(400).json({ message: 'isTyping must be a boolean' });
  }
  return next();
}
