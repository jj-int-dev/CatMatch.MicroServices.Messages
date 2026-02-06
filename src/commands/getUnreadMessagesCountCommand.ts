import { eq, sql } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { conversations, messages } from '../database-migrations/schema';

export type GetUnreadMessagesCountCommandResponse = Promise<{
  success: boolean;
  unreadCount?: number;
  errorMsg?: string;
}>;

/**
 * Gets the total count of unread messages for a user across all conversations
 * @param userId The ID of the user
 * @returns A {@link GetUnreadMessagesCountCommandResponse} containing the unread count
 */
export async function getUnreadMessagesCountCommand(
  userId: string
): GetUnreadMessagesCountCommandResponse {
  try {
    // Count all unread messages across all conversations where:
    // 1. The user is a participant in the conversation (either adopter or rehomer)
    // 2. The message was sent by someone else (not the current user)
    // 3. The message is not read (is_read = false)
    const recordCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .innerJoin(
        conversations,
        eq(messages.conversationId, conversations.conversationId)
      )
      .where(
        sql`(
          ${conversations.adopterId} = ${userId} 
          OR ${conversations.rehomerId} = ${userId}
        ) 
        AND ${messages.senderId} != ${userId}
        AND NOT ${messages.isRead}`
      );

    const unreadCount = +(recordCount[0]?.count ?? 0);

    return {
      success: true,
      unreadCount
    };
  } catch (error) {
    return {
      success: false,
      errorMsg: (error as Error).message
    };
  }
}
