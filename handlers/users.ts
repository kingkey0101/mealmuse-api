// handlers/users.ts
import { getDb } from '../utils/mongo';
import { ObjectId } from 'mongodb';

export interface UserProfile {
  _id?: ObjectId;
  userId: string;
  email: string;
  tier: 'free' | 'premium';
  subscription: {
    status: 'active' | 'inactive' | 'canceled';
    startDate: Date;
    renewalDate?: Date;
    canceledAt?: Date;
    stripeCustomerId?: string;
  };
  limits: {
    recipesPerMonth: number;
    aiChefChatsPerDay: number;
    recipeGenerationsPerDay: number;
  };
  usage: {
    recipesCreatedThisMonth: number;
    aiChefChatsToday: number;
    recipeGenerationsToday: number;
    lastResetDate: Date;
  };
  created_at: Date;
  updated_at: Date;
}

/**
 * Get or create user profile
 */
export async function getUserProfile(userId: string, email?: string): Promise<UserProfile> {
  const db = await getDb();
  const usersCollection = db.collection('users');

  let user = await usersCollection.findOne({ userId });

  if (!user) {
    // First time user = free tier
    const newUser: UserProfile = {
      userId,
      email: email || '',
      tier: 'free',
      subscription: { status: 'inactive', startDate: new Date() },
      limits: {
        recipesPerMonth: 5,
        aiChefChatsPerDay: 3,
        recipeGenerationsPerDay: 1,
      },
      usage: {
        recipesCreatedThisMonth: 0,
        aiChefChatsToday: 0,
        recipeGenerationsToday: 0,
        lastResetDate: new Date(),
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    await usersCollection.insertOne(newUser);
    return newUser;
  }

  return user as UserProfile;
}

/**
 * Update user tier (for stripe integration)
 */
export async function updateUserTier(
  userId: string,
  tier: 'free' | 'premium',
  stripeCustomerId?: string
): Promise<UserProfile | null> {
  const db = await getDb();
  const usersCollection = db.collection('users');

  const updateData: any = {
    tier,
    updated_at: new Date(),
  };

  if (stripeCustomerId) {
    updateData['subscription.stripeCustomerId'] = stripeCustomerId;
    updateData['subscription.status'] = 'active';
    updateData['subscription.startDate'] = new Date();
  }

  // Update limits based on tier
  if (tier === 'premium') {
    updateData['limits.recipesPerMonth'] = 999999;
    updateData['limits.aiChefChatsPerDay'] = 999999;
    updateData['limits.recipeGenerationsPerDay'] = 999999;
  } else {
    updateData['limits.recipesPerMonth'] = 5;
    updateData['limits.aiChefChatsPerDay'] = 3;
    updateData['limits.recipeGenerationsPerDay'] = 1;
  }

  const result = await usersCollection.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  return result.value as UserProfile | null;
}

/**
 * Check if user can perform action based on limits
 */
export async function checkLimit(userId: string, limitType: 'recipe' | 'aiChat' | 'recipeGen'): Promise<boolean> {
  const user = await getUserProfile(userId);

  if (user.tier === 'premium') return true; // Premium: no limits

  // Reset daily limits if needed
  const now = new Date();
  const lastReset = new Date(user.usage.lastResetDate);
  if (now.getDate() !== lastReset.getDate()) {
    // New day - reset daily counters
    await resetDailyUsage(userId);
    user.usage.aiChefChatsToday = 0;
    user.usage.recipeGenerationsToday = 0;
  }

  // Free tier checks
  if (limitType === 'recipe' && user.usage.recipesCreatedThisMonth >= user.limits.recipesPerMonth) {
    return false;
  }
  if (limitType === 'aiChat' && user.usage.aiChefChatsToday >= user.limits.aiChefChatsPerDay) {
    return false;
  }
  if (limitType === 'recipeGen' && user.usage.recipeGenerationsToday >= user.limits.recipeGenerationsPerDay) {
    return false;
  }

  return true;
}

/**
 * Increment usage counter
 */
export async function incrementUsage(userId: string, limitType: 'recipe' | 'aiChat' | 'recipeGen'): Promise<void> {
  const db = await getDb();
  const usersCollection = db.collection('users');

  const updateObj: any = {
    $set: { updated_at: new Date() },
    $inc: {}
  };

  if (limitType === 'recipe') {
    updateObj.$inc['usage.recipesCreatedThisMonth'] = 1;
  } else if (limitType === 'aiChat') {
    updateObj.$inc['usage.aiChefChatsToday'] = 1;
  } else if (limitType === 'recipeGen') {
    updateObj.$inc['usage.recipeGenerationsToday'] = 1;
  }

  await usersCollection.updateOne({ userId }, updateObj);
}

/**
 * Reset daily usage counters (called daily)
 */
export async function resetDailyUsage(userId: string): Promise<void> {
  const db = await getDb();
  const usersCollection = db.collection('users');

  await usersCollection.updateOne(
    { userId },
    {
      $set: {
        'usage.aiChefChatsToday': 0,
        'usage.recipeGenerationsToday': 0,
        'usage.lastResetDate': new Date(),
        updated_at: new Date(),
      },
    }
  );
}

/**
 * Get user usage stats
 */
export async function getUserUsageStats(userId: string): Promise<any> {
  const user = await getUserProfile(userId);

  return {
    tier: user.tier,
    limits: user.limits,
    usage: user.usage,
    subscription: user.subscription,
  };
}
