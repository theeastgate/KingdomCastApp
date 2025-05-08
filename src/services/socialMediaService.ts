import { supabase } from '../lib/supabase';
import type { Platform, Content } from '../types';

interface PostContent {
  message: string;
  mediaUrl?: string;
  scheduledFor?: string;
  platforms: Platform[];
}

export async function postToSocialMedia(content: PostContent) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get connected social accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .in('platform', content.platforms)
      .eq('user_id', user.id);

    if (accountsError) throw accountsError;
    if (!accounts.length) throw new Error('No connected social accounts found');

    const results = await Promise.allSettled(
      accounts.map(async (account) => {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-post/${account.platform}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content.message,
              mediaUrl: content.mediaUrl,
              scheduledFor: content.scheduledFor,
              accountId: account.id,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to post to ${account.platform}`);
        }

        return await response.json();
      })
    );

    // Check for any failures
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      throw new Error(
        `Failed to post to some platforms: ${failures
          .map(f => (f as PromiseRejectedResult).reason.message)
          .join(', ')}`
      );
    }

    return results;
  } catch (error: any) {
    console.error('Error posting to social media:', error);
    throw error;
  }
}