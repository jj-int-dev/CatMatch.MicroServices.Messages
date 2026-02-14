import { eq, sql } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { messages, conversations } from '../database-migrations/schema';
import {
  messagesValidator,
  type MessagesSchema
} from '../validators/database/messagesValidator';

export type GetMessagesCommandResponse = Promise<{
  success: boolean;
  data?: MessagesSchema;
  errorMsg?: string;
  totalResults?: number;
  page?: number;
  pageSize?: number;
}>;

/**
 * Gets messages for a conversation with pagination
 * @param conversationId The ID of the conversation
 * @param userId The ID of the user requesting messages (for authorization)
 * @param page The page number (1-indexed)
 * @param pageSize The number of items per page
 * @returns A {@link GetMessagesCommandResponse}
 */
export async function getMessagesCommand(
  conversationId: string,
  userId: string,
  page: number,
  pageSize: number
): GetMessagesCommandResponse {
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

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Get total count of messages in conversation
    const recordCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.conversationId, conversationId));
    const totalResults = +(recordCount[0]?.count ?? 0);

    // Get paginated messages
    const records = await db.execute(sql`
      SELECT 
        m.message_id AS "messageId",
        m.conversation_id AS "conversationId",
        m.sender_id AS "senderId",
        m.content,
        m.created_at AS "createdAt",
        m.is_read AS "isRead",
        m.read_at AS "readAt"
      FROM messages m
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
      LIMIT ${pageSize} OFFSET ${offset};
    `);

    const validationResult = messagesValidator.safeParse(records);

    if (validationResult.success) {
      return {
        success: true,
        data: validationResult.data,
        totalResults,
        page,
        pageSize
      };
    } else {
      return {
        success: false,
        errorMsg: validationResult.error.issues
          .map((issue) => issue.message)
          .join('\n'),
        totalResults,
        page,
        pageSize
      };
    }
  } catch (error) {
    return {
      success: false,
      errorMsg: (error as Error).message
    };
  }
}
