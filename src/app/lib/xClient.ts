export class XClient {
  async postTweet(text: string): Promise<{ success: boolean; tweetId?: string; tweetUrl?: string; error?: string }> {
    try {
      if (text.length > 280) {
        return { success: false, error: 'Tweet text exceeds 280 character limit' };
      }

      const response = await fetch('/api/tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to post tweet' };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while posting tweet'
      };
    }
  }
}

export const xClient = new XClient();