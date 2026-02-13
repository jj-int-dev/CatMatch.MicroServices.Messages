import { createConversationCommand } from '../commands/createConversationCommand';
import type { NewConversationSchema } from '../validators/database/createConversationValidator';
import HttpResponseError from '../dtos/httpResponseError';
import { validateConversationParticipants } from '../validators/userRoleValidator';

export type CreateConversationActionResponse = Promise<{
  conversation: NewConversationSchema;
}>;

/**
 * Creates a new conversation between an adopter and a rehomer
 * @param adopterId The ID of the adopter (must be an adopter user type)
 * @param rehomerId The ID of the rehomer (must be a rehomer user type)
 * @param animalId animal ID associated with the conversation
 * @returns A {@link CreateConversationActionResponse} containing the created conversation
 * @throws A {@link HttpResponseError} If an error occurred while creating the conversation
 */
export async function createConversationAction(
  adopterId: string,
  rehomerId: string,
  animalId: string
): CreateConversationActionResponse {
  console.log('Entering CreateConversationAction ...');

  // Validate that adopterId is actually an adopter and rehomerId is a rehomer
  const validation = await validateConversationParticipants(
    adopterId,
    rehomerId
  );

  if (!validation.valid) {
    console.error(
      `Role validation failed: ${validation.error}\nExiting CreateConversationAction ...`
    );
    throw new HttpResponseError(
      403,
      validation.error || 'Invalid user roles for conversation creation'
    );
  }

  // TODO: Validate that animalId belongs to rehomerId (if provided)
  // This would require querying the animals table to check ownership

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
