import * as z from 'zod';

export const messageValidator = z.object({
  messageId: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string(),
  createdAt: z.string(), // PostgreSQL timestamp format: 2026-02-12 01:38:25.815112+00
  isRead: z.boolean(),
  readAt: z.string().nullable().optional()
});

export const messagesValidator = z.array(messageValidator);

export type MessageSchema = z.infer<typeof messageValidator>;
export type MessagesSchema = z.infer<typeof messagesValidator>;
