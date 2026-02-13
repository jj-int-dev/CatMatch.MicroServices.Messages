import { deleteConversationCommand } from '../commands/deleteConversationCommand';
import HttpResponseError from '../dtos/httpResponseError';

export type DeleteConversationActionResponse = Promise<{
  success: boolean;
  hardDeleted: boolean;
}>;

/**
 * Deletes a conversation for a user (WhatsApp-style soft delete).
 * If both users have deleted the conversation, performs a hard delete.
 *
 * @param conversationId The ID of the conversation
 * @param userId The ID of the user deleting the conversation
 * @returns A {@link DeleteConversationActionResponse}
 * @throws A {@link HttpResponseError} If an error occurred while deleting the conversation
 */
export async function deleteConversationAction(
  conversationId: string,
  userId: string
): DeleteConversationActionResponse {
  console.log('Entering DeleteConversationAction ...');

  const { success, hardDeleted, errorMsg } = await deleteConversationCommand(
    conversationId,
    userId
  );

  if (success) {
    console.log(
      `Successfully ${hardDeleted ? 'hard' : 'soft'} deleted conversation ${conversationId} for user ${userId}\nExiting DeleteConversationAction ...`
    );

    return {
      success: true,
      hardDeleted
    };
  }

  const baseErrorMsg = `Error occurred while deleting conversation ${conversationId}`;
  const moreDetails = errorMsg ? `: ${errorMsg}` : '';
  console.error(`${baseErrorMsg}${moreDetails}`);

  // Check for specific error types to return appropriate status codes
  if (errorMsg?.includes('not found')) {
    throw new HttpResponseError(404, 'Conversation not found');
  }

  if (errorMsg?.includes('not a participant')) {
    throw new HttpResponseError(
      403,
      'User is not a participant in this conversation'
    );
  }

  throw new HttpResponseError(500, baseErrorMsg);
}
