import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Instagram auth error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/?error=missing_config', request.url));
  }

  try {
    // 1. Exchange code for short-lived access token
    const tokenForm = new FormData();
    tokenForm.append('client_id', clientId);
    tokenForm.append('client_secret', clientSecret);
    tokenForm.append('grant_type', 'authorization_code');
    tokenForm.append('redirect_uri', redirectUri);
    tokenForm.append('code', code);

    const shortLivedRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: tokenForm,
    });

    if (!shortLivedRes.ok) {
      const errorData = await shortLivedRes.text();
      console.error('Failed to get short-lived token:', errorData);
      throw new Error('Failed to get short-lived token');
    }

    const shortLivedData = await shortLivedRes.json();
    const shortToken = shortLivedData.access_token;
    // user_id is also returned: shortLivedData.user_id

    // 2. Exchange short-lived token for long-lived access token
    const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortToken}`;

    const longLivedRes = await fetch(longLivedUrl);

    if (!longLivedRes.ok) {
      const errorData = await longLivedRes.text();
      console.error('Failed to get long-lived token:', errorData);
      // Fallback to short-lived token if long-lived fails
      const cookieStore = await cookies();
      cookieStore.set('ig_token', shortToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour for short-lived
        path: '/',
      });
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const longLivedData = await longLivedRes.json();
    const longToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in; // Usually ~60 days

    // 3. Store token securely in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('ig_token', longToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn || 60 * 60 * 24 * 60, // Fallback to 60 days
      path: '/',
    });

    // We can also store the user ID if needed, but the token itself implies the user
    if (shortLivedData.user_id) {
       cookieStore.set('ig_user_id', shortLivedData.user_id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: expiresIn || 60 * 60 * 24 * 60,
        path: '/',
      });
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.redirect(new URL('/?error=auth_exchange_failed', request.url));
  }
}
