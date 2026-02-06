import { setTypingStatusCommand } from '../commands/setTypingStatusCommand';
import HttpResponseError from '../dtos/httpResponseError';

export type SetTypingStatusActionResponse = Promise<{
  success: boolean;
}>;

/**
 * Sets typing status for a user in a conversation
 * @param conversationId The ID of the conversation
 * @param userId The ID of the user who is typing
 * @param isTyping Whether the user is typing or not
 * @returns A {@link SetTypingStatusActionResponse}
 * @throws A {@link HttpResponseError} If an error occurred while setting typing status
 */
export async function setTypingStatusAction(
  conversationId: string,
  userId: string,
  isTyping: boolean
): SetTypingStatusActionResponse {
  console.log('Entering SetTypingStatusAction ...');

  const { success, errorMsg } = await setTypingStatusCommand(
    conversationId,
    userId,
    isTyping
  );

  if (success) {
    console.log(
      `Successfully set typing status for user ${userId} in conversation ${conversationId} to ${isTyping}\nExiting SetTypingStatusAction ...`
    );

    return {
      success: true
    };
  }

  const baseErrorMsg = `Error occurred while setting typing status for conversation ${conversationId}`;
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
