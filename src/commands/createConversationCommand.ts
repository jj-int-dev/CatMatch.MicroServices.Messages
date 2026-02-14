import { eq, and, sql } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { conversations } from '../database-migrations/schema';
import {
  createConversationValidator,
  type NewConversationSchema
} from '../validators/database/createConversationValidator';

export type CreateConversationCommandResponse = Promise<{
  success: boolean;
  data?: NewConversationSchema;
  errorMsg?: string;
}>;

/**
 * Creates a new conversation between an adopter and a rehomer
 * @param adopterId The ID of the adopter (must be an adopter user type)
 * @param rehomerId The ID of the rehomer (must be a rehomer user type)
 * @param animalId The animal ID associated with the conversation
 * @returns A {@link CreateConversationCommandResponse}
 */
export async function createConversationCommand(
  adopterId: string,
  rehomerId: string,
  animalId: string
): CreateConversationCommandResponse {
  try {
    // Check if conversation already exists between these users for this animal
    const existingConversations = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.adopterId, adopterId),
          eq(conversations.rehomerId, rehomerId),
          eq(conversations.animalId, animalId)
        )
      )
      .limit(1);

    if (existingConversations.length > 0) {
      const validationResult = createConversationValidator.safeParse(
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
        animalId,
        adopterLastActiveAt: sql`NOW()`,
        rehomerLastActiveAt: sql`NOW()`,
        lastMessageAt: null
      })
      .returning();
    const validationResult = createConversationValidator.safeParse(
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
