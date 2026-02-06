import { db } from '../utils/databaseClient';
import { conversations } from '../database-migrations/schema';
import { or, eq } from 'drizzle-orm';

/**
 * @param userId The ID of the owner of the conversations to delete
 */
export default async function (userId: string): Promise<void> {
  // delete conversations and messages from db. foreign key cascading will
  // cause any messages with these conversations' IDs to be deleted
  await db
    .delete(conversations)
    .where(
      or(
        eq(conversations.rehomerId, userId),
        eq(conversations.adopterId, userId)
      )
    );
}
