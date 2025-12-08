'use server';

import { generateUserAvatar } from '@/ai/flows/generate-user-avatar';

export async function generateAvatarAction(role: string) {
  try {
    const result = await generateUserAvatar({ userRole: role });
    if (!result || !result.avatarDataUri) {
      throw new Error('Avatar generation failed to return a data URI.');
    }
    return { success: true, avatarDataUri: result.avatarDataUri };
  } catch (error) {
    console.error('Avatar generation error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}
