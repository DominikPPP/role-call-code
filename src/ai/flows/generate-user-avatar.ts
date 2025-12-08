'use server';

/**
 * @fileOverview Avatar generation flow.
 *
 * Generates a unique avatar for a user based on their role.
 *
 * - `generateUserAvatar`: The main function to generate the avatar.
 * - `GenerateUserAvatarInput`: Input type for the function.
 * - `GenerateUserAvatarOutput`: Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUserAvatarInputSchema = z.object({
  userRole: z.string().describe('The role of the user (e.g., Academic Teacher).'),
});

export type GenerateUserAvatarInput = z.infer<typeof GenerateUserAvatarInputSchema>;

const GenerateUserAvatarOutputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      "A data URI containing the generated avatar image, must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type GenerateUserAvatarOutput = z.infer<typeof GenerateUserAvatarOutputSchema>;

export async function generateUserAvatar(input: GenerateUserAvatarInput): Promise<GenerateUserAvatarOutput> {
  return generateUserAvatarFlow(input);
}

const generateUserAvatarFlow = ai.defineFlow(
  {
    name: 'generateUserAvatarFlow',
    inputSchema: GenerateUserAvatarInputSchema,
    outputSchema: GenerateUserAvatarOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      prompt: `Generate a professional, front-facing, clean, and simple avatar for a user with the role: ${input.userRole}. The avatar should be in a square format and have a simple, professional background.`,
      model: 'googleai/imagen-4.0-fast-generate-001',
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate avatar image.');
    }

    return {avatarDataUri: media.url};
  }
);
