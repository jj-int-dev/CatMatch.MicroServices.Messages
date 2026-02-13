import * as z from 'zod';

export const getConversationValidator = z.object({
  conversationId: z.string().uuid(),
  adopterId: z.string().uuid(),
  rehomerId: z.string().uuid(),
  animalId: z.string().uuid().nullable(),
  createdAt: z.string(), // PostgreSQL timestamp format: 2026-02-12 01:38:25.815112+00
  lastMessageAt: z.string().nullable(),
  adopterLastActiveAt: z.string().nullable(),
  rehomerLastActiveAt: z.string().nullable(),
  adopterLastReadAt: z.string().nullable(),
  rehomerLastReadAt: z.string().nullable(),
  adopterIsTyping: z.boolean(),
  rehomerIsTyping: z.boolean(),
  adopterLastTypingAt: z.string().nullable(),
  rehomerLastTypingAt: z.string().nullable(),
  otherUserName: z.string().nullable(),
  otherUserProfilePicture: z.string().nullable(),
  unreadCount: z.number().int().min(0),
  animalName: z.string().nullable(),
  animalPhoto: z.string().nullable()
});

export const getConversationsValidator = z.array(getConversationValidator);

export type ConversationSchema = z.infer<typeof getConversationValidator>;
export type ConversationsSchema = z.infer<typeof getConversationsValidator>;
