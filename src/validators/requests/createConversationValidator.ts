import type { Request, Response, NextFunction } from 'express';
import * as z from 'zod';

const createConversationValidations = z.object({
  rehomerId: z.string().uuid('Rehomer ID must be a valid UUID'),
  animalId: z.string().uuid('Animal ID must be a valid UUID')
});

export type CreateConversationSchema = z.infer<
  typeof createConversationValidations
>;

export function createConversationValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const conversationData = createConversationValidations.safeParse(req.body);

    if (!conversationData.success) {
      const errors = conversationData.error.issues.map(
        (issue) => issue.message
      );
      console.log(
        `Conversation data validation error(s):\n${errors.join('\n')}`
      );
      return res.status(400).json({ message: 'Invalid conversation data' });
    }

    return next();
  } catch (err) {
    console.log(
      `Error occurred during conversation data validation middleware: ${err}`
    );
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
