import type { Request, Response, NextFunction } from 'express';
import * as z from 'zod';

const conversationIdValidations = z.object({
  conversationId: z.string().uuid('Conversation ID must be a valid UUID')
});

export function conversationIdValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const conversationIdData = conversationIdValidations.safeParse({
      conversationId: req.params.conversationId
    });

    if (!conversationIdData.success) {
      const errors = conversationIdData.error.issues.map(
        (issue) => issue.message
      );
      console.log(`Conversation ID validation error(s):\n${errors.join('\n')}`);
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    return next();
  } catch (err) {
    console.log(
      `Error occurred during conversation ID validation middleware: ${err}`
    );
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
