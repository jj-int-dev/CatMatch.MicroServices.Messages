import { markAsReadCommand } from '../commands/markAsReadCommand';
import HttpResponseError from '../dtos/httpResponseError';

export type MarkAsReadActionResponse = Promise<{
  updatedCount: number;
}>;

/**
 * Marks messages as read for a user in a conversation
 * @param conversationId The ID of the conversation
 * @param userId The ID of the user marking messages as read
 * @returns A {@link MarkAsReadActionResponse} containing the count of updated messages
 * @throws A {@link HttpResponseError} If an error occurred while marking messages as read
 */
export async function markAsReadAction(
  conversationId: string,
  userId: string
): MarkAsReadActionResponse {
  console.log('Entering MarkAsReadAction ...');

  const { success, errorMsg, updatedCount } = await markAsReadCommand(
    conversationId,
    userId
  );

  if (success) {
    console.log(
      `Successfully marked ${updatedCount || 0} messages as read in conversation ${conversationId} for user ${userId}\nExiting MarkAsReadAction ...`
    );

    return {
      updatedCount: updatedCount || 0
    };
  }

  const baseErrorMsg = `Error occurred while marking messages as read in conversation ${conversationId}`;
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
