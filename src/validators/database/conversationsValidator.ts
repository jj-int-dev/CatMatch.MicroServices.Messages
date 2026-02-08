import * as z from 'zod';

export const conversationValidator = z.object({
  conversationId: z.string().uuid(),
  adopterId: z.string().uuid(),
  rehomerId: z.string().uuid(),
  animalId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  lastMessageAt: z.string().datetime().nullable(),
  adopterLastActiveAt: z.string().datetime().nullable(),
  rehomerLastActiveAt: z.string().datetime().nullable(),
  adopterLastReadAt: z.string().datetime().nullable(),
  rehomerLastReadAt: z.string().datetime().nullable(),
  adopterIsTyping: z.boolean(),
  rehomerIsTyping: z.boolean(),
  adopterLastTypingAt: z.string().datetime().nullable(),
  rehomerLastTypingAt: z.string().datetime().nullable(),
  otherUserName: z.string().nullable(),
  otherUserProfilePicture: z.string().nullable(),
  unreadCount: z.number().int().min(0),
  animalName: z.string().nullable(),
  animalPhoto: z.string().nullable()
});

export const conversationsValidator = z.array(conversationValidator);

export type ConversationSchema = z.infer<typeof conversationValidator>;
export type ConversationsSchema = z.infer<typeof conversationsValidator>;
