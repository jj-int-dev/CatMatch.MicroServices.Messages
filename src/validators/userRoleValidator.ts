import { eq } from 'drizzle-orm';
import { db } from '../utils/databaseClient';
import { users, usertypes } from '../database-migrations/schema';

/**
 * Validates that a user has a specific user type
 * @param userId The ID of the user to check
 * @param expectedType The expected user type ('Adopter' or 'Rehomer')
 * @returns Promise<boolean> - true if user has the expected type, false otherwise
 */
export async function validateUserType(
  userId: string,
  expectedType: 'Adopter' | 'Rehomer'
): Promise<boolean> {
  try {
    // Query user with their user type
    const result = await db
      .select({
        userType: usertypes.type
      })
      .from(users)
      .innerJoin(usertypes, eq(users.userTypeId, usertypes.userTypeId))
      .where(eq(users.userId, userId))
      .limit(1);

    if (result.length === 0 || !result[0]) {
      // User not found
      return false;
    }

    // Check if user type matches expected type (case-insensitive)
    return result[0].userType.toLowerCase() === expectedType.toLowerCase();
  } catch (error) {
    console.error('Error validating user type:', error);
    return false;
  }
}

/**
 * Validates that the adopter and rehomer have the correct user types
 * @param adopterId The ID of the adopter
 * @param rehomerId The ID of the rehomer
 * @returns Promise<{valid: boolean, error?: string}>
 */
export async function validateConversationParticipants(
  adopterId: string,
  rehomerId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Validate adopter
    const isAdopter = await validateUserType(adopterId, 'Adopter');
    if (!isAdopter) {
      return {
        valid: false,
        error: `User ${adopterId} is not an Adopter or does not exist`
      };
    }

    // Validate rehomer
    const isRehomer = await validateUserType(rehomerId, 'Rehomer');
    if (!isRehomer) {
      return {
        valid: false,
        error: `User ${rehomerId} is not a Rehomer or does not exist`
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: (error as Error).message
    };
  }
}
