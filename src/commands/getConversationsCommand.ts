import { eq, or, sql } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { conversations } from '../database-migrations/schema';
import {
  getConversationsValidator,
  type ConversationsSchema
} from '../validators/database/getConversationValidator';

export type GetConversationsCommandResponse = Promise<{
  success: boolean;
  data?: ConversationsSchema;
  errorMsg?: string;
  totalResults?: number;
  page?: number;
  pageSize?: number;
}>;

/**
 * Gets conversations for a user with pagination
 * @param userId The ID of the user
 * @param page The page number (1-indexed)
 * @param pageSize The number of items per page
 * @returns A {@link GetConversationsCommandResponse}
 */
export async function getConversationsCommand(
  userId: string,
  page: number,
  pageSize: number
): GetConversationsCommandResponse {
  try {
    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Get total count of conversations where user is either adopter or rehomer
    const recordCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(
        or(
          eq(conversations.adopterId, userId),
          eq(conversations.rehomerId, userId)
        )
      );
    const totalResults = +(recordCount[0]?.count ?? 0);

    // Get paginated conversations with user details and metadata
    const records = await db.execute(sql`
      SELECT 
        c.conversation_id AS "conversationId",
        c.adopter_id AS "adopterId",
        c.rehomer_id AS "rehomerId",
        c.animal_id AS "animalId",
        c.created_at AS "createdAt",
        c.last_message_at AS "lastMessageAt",
        c.adopter_last_active_at AS "adopterLastActiveAt",
        c.rehomer_last_active_at AS "rehomerLastActiveAt",
        c.adopter_last_read_at AS "adopterLastReadAt",
        c.rehomer_last_read_at AS "rehomerLastReadAt",
        c.adopter_is_typing AS "adopterIsTyping",
        c.rehomer_is_typing AS "rehomerIsTyping",
        c.adopter_last_typing_at AS "adopterLastTypingAt",
        c.rehomer_last_typing_at AS "rehomerLastTypingAt",
        json_build_object(
          'userId', ua.user_id,
          'displayName', ua.display_name,
          'avatarUrl', ua.avatar_url
        ) AS "otherUser",
        -- Get unread count for the current user
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.conversation_id = c.conversation_id 
            AND m.sender_id != ${userId}
            AND NOT m.is_read
        ) AS "unreadCount",
        -- Get animal details
        COALESCE(
          (
            SELECT json_build_object(
              'name', a.name,
              'photoUrl', ap.photo_url
            )
            FROM animals a
            LEFT JOIN animal_photos ap ON a.animal_id = ap.animal_id AND ap.order = 0
            WHERE a.animal_id = c.animal_id
            LIMIT 1
          ),
          'null'::json
        ) AS "animalDetails"
      FROM conversations c
      LEFT JOIN users ua ON (
        CASE 
          WHEN c.adopter_id = ${userId} THEN c.rehomer_id = ua.user_id
          ELSE c.adopter_id = ua.user_id
        END
      )
      WHERE c.adopter_id = ${userId} OR c.rehomer_id = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset};
    `);

    // Transform the result to match our validator
    // Apply typing indicator expiration logic (indicators older than 10 seconds are stale)
    const now = new Date();
    const transformedRecords = records.map((record: any) => {
      const adopterLastTypingAt = record.adopterLastTypingAt
        ? new Date(record.adopterLastTypingAt)
        : null;
      const rehomerLastTypingAt = record.rehomerLastTypingAt
        ? new Date(record.rehomerLastTypingAt)
        : null;

      // Check if typing indicators are stale (> 10 seconds old)
      const adopterIsTyping =
        record.adopterIsTyping &&
        adopterLastTypingAt &&
        now.getTime() - adopterLastTypingAt.getTime() < 10000;

      const rehomerIsTyping =
        record.rehomerIsTyping &&
        rehomerLastTypingAt &&
        now.getTime() - rehomerLastTypingAt.getTime() < 10000;

      return {
        conversationId: record.conversationId,
        adopterId: record.adopterId,
        rehomerId: record.rehomerId,
        animalId: record.animalId,
        createdAt: record.createdAt,
        lastMessageAt: record.lastMessageAt,
        adopterLastActiveAt: record.adopterLastActiveAt,
        rehomerLastActiveAt: record.rehomerLastActiveAt,
        adopterLastReadAt: record.adopterLastReadAt,
        rehomerLastReadAt: record.rehomerLastReadAt,
        adopterIsTyping,
        rehomerIsTyping,
        adopterLastTypingAt: record.adopterLastTypingAt,
        rehomerLastTypingAt: record.rehomerLastTypingAt,
        otherUserName: record.otherUser?.displayName || null,
        otherUserProfilePicture: record.otherUser?.avatarUrl || null,
        unreadCount: parseInt(record.unreadCount) || 0,
        animalName: record.animalDetails?.name || null,
        animalPhoto: record.animalDetails?.photoUrl || null
      };
    });

    const validationResult =
      getConversationsValidator.safeParse(transformedRecords);

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
