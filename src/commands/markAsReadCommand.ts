import { eq, and, sql } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { conversations, messages } from '../database-migrations/schema';

export type MarkAsReadCommandResponse = Promise<{
  success: boolean;
  errorMsg?: string;
  updatedCount?: number;
}>;

/**
 * Marks messages as read for a user in a conversation
 * @param conversationId The ID of the conversation
 * @param userId The ID of the user marking messages as read
 * @returns A {@link MarkAsReadCommandResponse}
 */
export async function markAsReadCommand(
  conversationId: string,
  userId: string
): MarkAsReadCommandResponse {
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

    // Determine which field to update in conversations table
    const updateConversationField =
      userId === conv.adopterId ? 'adopterLastReadAt' : 'rehomerLastReadAt';

    // Update conversation read timestamp
    await db
      .update(conversations)
      .set({
        [updateConversationField]: sql`NOW()`
      })
      .where(eq(conversations.conversationId, conversationId));

    // Mark all unread messages from other user as read
    const otherUserId =
      userId === conv.adopterId ? conv.rehomerId : conv.adopterId;

    const result = await db
      .update(messages)
      .set({
        isRead: true,
        readAt: sql`NOW()`
      })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.senderId, otherUserId),
          eq(messages.isRead, false)
        )
      )
      .returning();

    return {
      success: true,
      updatedCount: result.length
    };
  } catch (error) {
    return {
      success: false,
      errorMsg: (error as Error).message
    };
  }
}
