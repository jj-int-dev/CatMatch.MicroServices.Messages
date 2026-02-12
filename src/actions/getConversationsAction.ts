import { getConversationsCommand } from '../commands/getConversationsCommand';
import type { ConversationsSchema } from '../validators/database/getConversationValidator';
import HttpResponseError from '../dtos/httpResponseError';

export type GetConversationsActionResponse = Promise<{
  conversations: ConversationsSchema;
  pagination: {
    totalResults: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}>;

/**
 * Gets conversations for a user with pagination
 * @param userId The ID of the user
 * @param page The page number (1-indexed)
 * @param pageSize The number of items per page
 * @returns A {@link GetConversationsActionResponse} containing conversations and pagination metadata
 * @throws A {@link HttpResponseError} If an error occurred while fetching conversations
 */
export async function getConversationsAction(
  userId: string,
  page: number,
  pageSize: number
): GetConversationsActionResponse {
  console.log('Entering GetConversationsAction ...');

  const {
    success,
    data,
    errorMsg,
    totalResults,
    page: resultPage,
    pageSize: resultPageSize
  } = await getConversationsCommand(userId, page, pageSize);

  if (success && data) {
    const totalPages = Math.ceil(
      (totalResults || 0) / (resultPageSize || pageSize)
    );

    console.log(
      `Successfully retrieved ${data.length} conversations for user ${userId} (page ${resultPage || page}, size ${resultPageSize || pageSize})\nExiting GetConversationsAction ...`
    );

    return {
      conversations: data,
      pagination: {
        totalResults: totalResults || 0,
        page: resultPage || page,
        pageSize: resultPageSize || pageSize,
        totalPages: totalPages || 1
      }
    };
  }

  const baseErrorMsg = `Error occurred while fetching conversations for user ${userId}`;
  const moreDetails = errorMsg ? `: ${errorMsg}` : '';
  console.error(`${baseErrorMsg}${moreDetails}`);
  throw new HttpResponseError(500, baseErrorMsg);
}
