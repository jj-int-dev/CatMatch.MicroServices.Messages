import { getUnreadMessagesCountCommand } from '../commands/getUnreadMessagesCountCommand';
import HttpResponseError from '../dtos/httpResponseError';

export type GetUnreadMessagesCountActionResponse = Promise<{
  unreadCount: number;
}>;

/**
 * Gets the total count of unread messages for a user across all conversations
 * @param userId The ID of the user
 * @returns A {@link GetUnreadMessagesCountActionResponse} containing the unread count
 * @throws A {@link HttpResponseError} If an error occurred while fetching unread count
 */
export async function getUnreadMessagesCountAction(
  userId: string
): GetUnreadMessagesCountActionResponse {
  console.log('Entering GetUnreadMessagesCountAction ...');

  const { success, unreadCount, errorMsg } =
    await getUnreadMessagesCountCommand(userId);

  if (success && unreadCount !== undefined) {
    console.log(
      `Successfully retrieved unread messages count ${unreadCount} for user ${userId}\nExiting GetUnreadMessagesCountAction ...`
    );

    return {
      unreadCount
    };
  }

  const baseErrorMsg = `Error occurred while fetching unread messages count for user ${userId}`;
  const moreDetails = errorMsg ? `: ${errorMsg}` : '';
  console.error(`${baseErrorMsg}${moreDetails}`);
  throw new HttpResponseError(500, baseErrorMsg);
}
