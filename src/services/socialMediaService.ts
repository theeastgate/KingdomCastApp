import { supabase } from '../lib/supabase';
import type { Platform, Content } from '../types';

interface PostContent {
  message: string;
  mediaUrl?: string;
  scheduledFor?: string;
  platforms: Platform[];
}

interface PostError {
  platform: Platform;
  message: string;
  details?: string;
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
    
    // Check if all requested platforms are connected
    const missingPlatforms = content.platforms.filter(
      platform => !accounts.find(account => account.platform === platform)
    );
    
    if (missingPlatforms.length > 0) {
      throw new Error(
        `Not connected to the following platforms: ${missingPlatforms.join(', ')}. ` +
        'Please connect these accounts in Settings before posting.'
      );
    }

    const errors: PostError[] = [];
    const successes: Platform[] = [];

    await Promise.all(
      accounts.map(async (account) => {
        try {
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

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Failed to post to ${account.platform}`);
          }

          successes.push(account.platform);
          return data;
        } catch (error: any) {
          errors.push({
            platform: account.platform,
            message: error.message,
            details: error.details || undefined
          });
        }
      })
    );

    // If there were any errors, throw a detailed error message
    if (errors.length > 0) {
      const errorMessage = errors.map(error => {
        let message = `${error.platform}: ${error.message}`;
        if (error.details) {
          message += `\nDetails: ${error.details}`;
        }
        return message;
      }).join('\n');

      throw new Error(
        `Failed to post to some platforms:\n${errorMessage}\n\n` +
        (successes.length > 0 ? `Successfully posted to: ${successes.join(', ')}` : '')
      );
    }

    return { success: true, platforms: successes };
  } catch (error: any) {
    console.error('Error posting to social media:', error);
    throw new Error(error.message || 'Failed to post content');
  }
}