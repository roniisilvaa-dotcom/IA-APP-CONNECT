import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  // Use upsert to handle concurrent inserts of the same user ID safely.
  // Updates email and name if the user already exists, or inserts a new record.
  try {
    const result = await db.insert(users)
      .values({
        id: uid, // Use Firebase UID directly as users.id primary key
        email,
        name: name || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          name: name || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database query failed in getOrCreateUser:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
