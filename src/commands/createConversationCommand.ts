import { eq, and, sql } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { conversations } from '../database-migrations/schema';
import {
  conversationValidator,
  type ConversationSchema
} from '../validators/database/conversationsValidator';

export type CreateConversationCommandResponse = Promise<{
  success: boolean;
  data?: ConversationSchema;
  errorMsg?: string;
}>;

/**
 * Creates a new conversation between an adopter and a rehomer
 * @param adopterId The ID of the adopter (must be an adopter user type)
 * @param rehomerId The ID of the rehomer (must be a rehomer user type)
 * @param animalId Optional animal ID associated with the conversation
 * @returns A {@link CreateConversationCommandResponse}
 */
export async function createConversationCommand(
  adopterId: string,
  rehomerId: string,
  animalId?: string
): CreateConversationCommandResponse {
  try {
    // Check if users exist and have correct user types
    // Note: In a real implementation, we would check user types from the users table
    // For now, we'll assume the validation happens at the action level

    // Check if conversation already exists between these users
    const existingConversations = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.adopterId, adopterId),
          eq(conversations.rehomerId, rehomerId)
        )
      )
      .limit(1);

    if (existingConversations.length > 0) {
      const validationResult = conversationValidator.safeParse(
        existingConversations[0]
      );

      if (validationResult.success) {
        return {
          success: true,
          data: validationResult.data
        };
      }
    }

    // Create new conversation
    const newConversation = await db
      .insert(conversations)
      .values({
        adopterId,
        rehomerId,
        adopterLastActiveAt: sql`NOW()`,
        rehomerLastActiveAt: sql`NOW()`,
        lastMessageAt: null
      })
      .returning();

    const validationResult = conversationValidator.safeParse(
      newConversation[0]
    );

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
