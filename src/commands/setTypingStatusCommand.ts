import { eq, sql } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { conversations } from '../database-migrations/schema';

export type SetTypingStatusCommandResponse = Promise<{
  success: boolean;
  errorMsg?: string;
}>;

/**
 * Sets typing status for a user in a conversation
 * @param conversationId The ID of the conversation
 * @param userId The ID of the user who is typing
 * @param isTyping Whether the user is typing or not
 * @returns A {@link SetTypingStatusCommandResponse}
 */
export async function setTypingStatusCommand(
  conversationId: string,
  userId: string,
  isTyping: boolean
): SetTypingStatusCommandResponse {
  try {
    // Check if conversation exists and user is a participant
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.conversationId, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      return {
        success: false,
        errorMsg: 'Conversation not found'
      };
    }

    const conv = conversation[0];
    if (!conv) {
      return {
        success: false,
        errorMsg: 'Conversation not found'
      };
    }

    if (conv.adopterId !== userId && conv.rehomerId !== userId) {
      return {
        success: false,
        errorMsg: 'User is not a participant in this conversation'
      };
    }

    // Determine which fields to update based on user role
    const isAdopter = userId === conv.adopterId;
    const updateFields = isAdopter
      ? {
          adopterIsTyping: isTyping,
          adopterLastTypingAt: isTyping ? sql`NOW()` : undefined
        }
      : {
          rehomerIsTyping: isTyping,
          rehomerLastTypingAt: isTyping ? sql`NOW()` : undefined
        };

    // Update typing status
    await db
      .update(conversations)
      .set(updateFields)
      .where(eq(conversations.conversationId, conversationId));

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      errorMsg: (error as Error).message
    };
  }
}
