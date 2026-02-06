import { createConversationCommand } from '../commands/createConversationCommand';
import type { ConversationSchema } from '../validators/database/conversationsValidator';
import HttpResponseError from '../dtos/httpResponseError';

export type CreateConversationActionResponse = Promise<{
  conversation: ConversationSchema;
}>;

/**
 * Creates a new conversation between an adopter and a rehomer
 * @param adopterId The ID of the adopter (must be an adopter user type)
 * @param rehomerId The ID of the rehomer (must be a rehomer user type)
 * @param animalId Optional animal ID associated with the conversation
 * @returns A {@link CreateConversationActionResponse} containing the created conversation
 * @throws A {@link HttpResponseError} If an error occurred while creating the conversation
 */
export async function createConversationAction(
  adopterId: string,
  rehomerId: string,
  animalId?: string
): CreateConversationActionResponse {
  console.log('Entering CreateConversationAction ...');

  // Note: In a real implementation, we would validate that:
  // 1. adopterId is actually an adopter (user type check)
  // 2. rehomerId is actually a rehomer (user type check)
  // 3. animalId belongs to rehomerId (if provided)
  // For now, we'll assume these validations happen at the route level

  const { success, data, errorMsg } = await createConversationCommand(
    adopterId,
    rehomerId,
    animalId
  );

  if (success && data) {
    console.log(
      `Successfully created conversation ${data.conversationId} between adopter ${adopterId} and rehomer ${rehomerId}\nExiting CreateConversationAction ...`
    );

    return {
      conversation: data
    };
  }

  const baseErrorMsg = `Error occurred while creating conversation between adopter ${adopterId} and rehomer ${rehomerId}`;
  const moreDetails = errorMsg ? `: ${errorMsg}` : '';
  console.error(`${baseErrorMsg}${moreDetails}`);

  // Check for specific error types to return appropriate status codes
  if (errorMsg?.includes('already exists')) {
    throw new HttpResponseError(409, 'Conversation already exists');
  }

  throw new HttpResponseError(500, baseErrorMsg);
}
