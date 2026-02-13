import { eq, sql } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { messages, conversations } from '../database-migrations/schema';
import {
  messageValidator,
  type MessageSchema
} from '../validators/database/messagesValidator';

export type SendMessageCommandResponse = Promise<{
  success: boolean;
  data?: MessageSchema;
  errorMsg?: string;
}>;

/**
 * Sends a message in a conversation
 * @param conversationId The ID of the conversation
 * @param senderId The ID of the user sending the message
 * @param content The message content
 * @returns A {@link SendMessageCommandResponse}
 */
export async function sendMessageCommand(
  conversationId: string,
  senderId: string,
  content: string
): SendMessageCommandResponse {
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

    if (conv.adopterId !== senderId && conv.rehomerId !== senderId) {
      return {
        success: false,
        errorMsg: 'User is not a participant in this conversation'
      };
    }

    // Create message
    const newMessage = await db
      .insert(messages)
      .values({
        conversationId,
        senderId,
        content,
        isRead: false
      })
      .returning();

    // Update conversation last message timestamp and user activity
    const updateFields: any = {
      lastMessageAt: sql`NOW()`
    };

    // Update last active timestamp for the sender
    if (senderId === conv.adopterId) {
      updateFields.adopterLastActiveAt = sql`NOW()`;
      // Clear sender's deleted_at if they previously deleted the conversation
      updateFields.adopterDeletedAt = null;
    } else {
      updateFields.rehomerLastActiveAt = sql`NOW()`;
      // Clear sender's deleted_at if they previously deleted the conversation
      updateFields.rehomerDeletedAt = null;
    }

    // Clear recipient's deleted_at to restore conversation for them
    if (senderId === conv.adopterId) {
      updateFields.rehomerDeletedAt = null;
    } else {
      updateFields.adopterDeletedAt = null;
    }

    await db
      .update(conversations)
      .set(updateFields)
      .where(eq(conversations.conversationId, conversationId));

    const validationResult = messageValidator.safeParse(newMessage[0]);

    if (validationResult.success) {
      return {
        success: true,
        data: validationResult.data
      };
    } else {
      return {
        success: false,
        errorMsg: validationResult.error.issues
          .map((issue) => issue.message)
          .join('\n')
      };
    }
  } catch (error) {
    return {
      success: false,
      errorMsg: (error as Error).message
    };
  }
}
