import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for validating avatar URL
const updateAvatarSchema = z.object({
  avatarUrl: z.string().url('Invalid URL format').refine(
    (url) => {
      const allowedHostnames = [
        'avatars.githubusercontent.com',
        '127.0.0.1',
        'llmgwifgtszjgjlzlwjq.supabase.co'
      ];
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        // Exact match
        if (allowedHostnames.includes(hostname)) {
          return true;
        }

        // Check subdomains: ensure we're not bypassing with nested domains
        // Example: attacker.github.com should NOT match github.com
        // But user.github.com SHOULD match github.com
        for (const allowed of allowedHostnames) {
          const allowedLower = allowed.toLowerCase();
          if (hostname.endsWith(`.${allowedLower}`)) {
            // Extract the part before the matched domain
            const prefix = hostname.slice(0, hostname.length - allowedLower.length - 1);
            // Ensure there's at least one character and no additional dots in the prefix
            // This prevents: evil.github.com.attacker.com from matching github.com
            if (prefix.length > 0 && !prefix.includes('.')) {
              return true;
            }
          }
        }

        return false;
      } catch {
        return false;
      }
    },
    { message: 'Avatar URL must be from allowed domains only' }
  )
});

export async function POST(request: Request) {
  try {
    // Get current user session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateAvatarSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { avatarUrl } = validationResult.data;

    // Update user's avatar (only for the authenticated user)
    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating avatar:', error);
      return NextResponse.json(
        { error: 'Failed to update avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error in update-avatar route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}