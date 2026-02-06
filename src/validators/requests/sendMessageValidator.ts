import type { Request, Response, NextFunction } from 'express';
import * as z from 'zod';

const sendMessageValidations = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(5000, 'Message content must be 5000 characters or less')
});

export type SendMessageSchema = z.infer<typeof sendMessageValidations>;

export function sendMessageValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const messageData = sendMessageValidations.safeParse(req.body);

    if (!messageData.success) {
      const errors = messageData.error.issues.map((issue) => issue.message);
      console.log(`Message data validation error(s):\n${errors.join('\n')}`);
      return res.status(400).json({ message: 'Invalid message data' });
    }

    return next();
  } catch (err) {
    console.log(
      `Error occurred during message data validation middleware: ${err}`
    );
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
