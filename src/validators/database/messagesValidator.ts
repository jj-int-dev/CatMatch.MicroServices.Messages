import * as z from 'zod';

export const messageValidator = z.object({
  messageId: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string(),
  createdAt: z.string().datetime(),
  isRead: z.boolean(),
  readAt: z.string().datetime().nullable().optional()
});

export const messagesValidator = z.array(messageValidator);

export type MessageSchema = z.infer<typeof messageValidator>;
export type MessagesSchema = z.infer<typeof messagesValidator>;
