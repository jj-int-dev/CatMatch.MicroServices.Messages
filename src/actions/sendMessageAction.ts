import { sendMessageCommand } from '../commands/sendMessageCommand';
import type { MessageSchema } from '../validators/database/messagesValidator';
import HttpResponseError from '../dtos/httpResponseError';

export type SendMessageActionResponse = Promise<{
  message: MessageSchema;
}>;

/**
 * Sends a message in a conversation
 * @param conversationId The ID of the conversation
 * @param senderId The ID of the user sending the message
 * @param content The message content
 * @returns A {@link SendMessageActionResponse} containing the sent message
 * @throws A {@link HttpResponseError} If an error occurred while sending the message
 */
export async function sendMessageAction(
  conversationId: string,
  senderId: string,
  content: string
): SendMessageActionResponse {
  console.log('Entering SendMessageAction ...');

  const { success, data, errorMsg } = await sendMessageCommand(
    conversationId,
    senderId,
    content
  );

  if (success && data) {
    console.log(
      `Successfully sent message ${data.messageId} in conversation ${conversationId} from user ${senderId}\nExiting SendMessageAction ...`
    );

    return {
      message: data
    };
  }

  const baseErrorMsg = `Error occurred while sending message in conversation ${conversationId}`;
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
