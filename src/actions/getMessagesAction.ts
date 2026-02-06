import { getMessagesCommand } from '../commands/getMessagesCommand';
import type { MessagesSchema } from '../validators/database/messagesValidator';
import HttpResponseError from '../dtos/httpResponseError';

export type GetMessagesActionResponse = Promise<{
  messages: MessagesSchema;
  pagination: {
    totalResults: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}>;

/**
 * Gets messages for a conversation with pagination
 * @param conversationId The ID of the conversation
 * @param userId The ID of the user requesting messages (for authorization)
 * @param page The page number (1-indexed)
 * @param pageSize The number of items per page
 * @returns A {@link GetMessagesActionResponse} containing messages and pagination metadata
 * @throws A {@link HttpResponseError} If an error occurred while fetching messages
 */
export async function getMessagesAction(
  conversationId: string,
  userId: string,
  page: number,
  pageSize: number
): GetMessagesActionResponse {
  console.log('Entering GetMessagesAction ...');

  const {
    success,
    data,
    errorMsg,
    totalResults,
    page: resultPage,
    pageSize: resultPageSize
  } = await getMessagesCommand(conversationId, userId, page, pageSize);

  if (success && data) {
    const totalPages = Math.ceil(
      (totalResults || 0) / (resultPageSize || pageSize)
    );

    console.log(
      `Successfully retrieved ${data.length} messages for conversation ${conversationId} (page ${resultPage || page}, size ${resultPageSize || pageSize})\nExiting GetMessagesAction ...`
    );

    return {
      messages: data,
      pagination: {
        totalResults: totalResults || 0,
        page: resultPage || page,
        pageSize: resultPageSize || pageSize,
        totalPages
      }
    };
  }

  const baseErrorMsg = `Error occurred while fetching messages for conversation ${conversationId}`;
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
