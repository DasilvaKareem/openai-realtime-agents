import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tweet text cannot be empty' },
        { status: 400 }
      );
    }

    if (text.length > 280) {
      return NextResponse.json(
        {
          success: false,
          error: `Tweet text is too long (${text.length} characters). Maximum allowed is 280 characters.`
        },
        { status: 400 }
      );
    }

    // Check for required environment variables
    const apiKey = process.env.X_API_KEY;
    const apiKeySecret = process.env.X_API_KEY_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

    if (!apiKey || !apiKeySecret || !accessToken || !accessTokenSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'X/Twitter API credentials are not configured. Please set X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, and X_ACCESS_TOKEN_SECRET environment variables.'
        },
        { status: 500 }
      );
    }

    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiKeySecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });

    // Post the tweet
    const tweet = await client.v2.tweet(text);

    return NextResponse.json({
      success: true,
      tweetId: tweet.data.id,
      tweetUrl: `https://x.com/i/web/status/${tweet.data.id}`
    });

  } catch (error) {
    console.error('Tweet posting error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while posting tweet'
      },
      { status: 500 }
    );
  }
}