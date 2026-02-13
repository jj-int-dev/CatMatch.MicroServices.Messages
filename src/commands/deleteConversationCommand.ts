import { eq, sql, and } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { conversations } from '../database-migrations/schema';

export type DeleteConversationCommandResponse = Promise<{
  success: boolean;
  hardDeleted: boolean;
  errorMsg?: string;
}>;

/**
 * Soft deletes a conversation for a user (WhatsApp-style).
 * If both users have deleted the conversation, performs a hard delete.
 *
 * @param conversationId The ID of the conversation
 * @param userId The ID of the user deleting the conversation
 * @returns A {@link DeleteConversationCommandResponse}
 */
export async function deleteConversationCommand(
  conversationId: string,
  userId: string
): DeleteConversationCommandResponse {
  try {
    // Get the conversation to check if user is a participant
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.conversationId, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      return {
        success: false,
        hardDeleted: false,
        errorMsg: 'Conversation not found'
      };
    }

    const conv = conversation[0];
    if (!conv) {
      return {
        success: false,
        hardDeleted: false,
        errorMsg: 'Conversation not found'
      };
    }

    // Check if user is a participant
    if (conv.adopterId !== userId && conv.rehomerId !== userId) {
      return {
        success: false,
        hardDeleted: false,
        errorMsg: 'User is not a participant in this conversation'
      };
    }

    // Determine which user is deleting
    const isAdopter = conv.adopterId === userId;
    const otherUserDeletedAt = isAdopter
      ? conv.rehomerDeletedAt
      : conv.adopterDeletedAt;

    // If other user has already deleted, perform hard delete
    if (otherUserDeletedAt !== null) {
      await db
        .delete(conversations)
        .where(eq(conversations.conversationId, conversationId));

      return {
        success: true,
        hardDeleted: true
      };
    }

    // Otherwise, perform soft delete for this user
    const updateFields: any = {};
    if (isAdopter) {
      updateFields.adopterDeletedAt = sql`NOW()`;
    } else {
      updateFields.rehomerDeletedAt = sql`NOW()`;
    }

    await db
      .update(conversations)
      .set(updateFields)
      .where(eq(conversations.conversationId, conversationId));

    return {
      success: true,
      hardDeleted: false
    };
  } catch (error) {
    return {
      success: false,
      hardDeleted: false,
      errorMsg: (error as Error).message
    };
  }
}
