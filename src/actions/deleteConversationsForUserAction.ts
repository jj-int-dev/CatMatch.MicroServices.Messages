import deleteConversationsForUserCommand from '../commands/deleteConversationsForUserCommand';

/**
 * Deletes an animal listing
 * @param userId The ID of the user
 */
export async function deleteConversationsForUserAction(
  userId: string
): Promise<void> {
  console.log('Entering DeleteConversationsForUserAction...');

  await deleteConversationsForUserCommand(userId);

  console.log(
    `Deleted all conversations for user ${userId}\nExiting DeleteConversationsForUserAction...`
  );
}
