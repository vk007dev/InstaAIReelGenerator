import { cookies } from 'next/headers';

const API_BASE = 'https://graph.instagram.com/v21.0';

export interface InstagramProfile {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  biography?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

async function getToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ig_token')?.value;
  if (!token) throw new Error('Not authenticated');
  return token;
}

export async function getProfile(): Promise<InstagramProfile> {
  const token = await getToken();

  // Note: graph.instagram.com requires fields. Some fields might only be available for business accounts via graph.facebook.com,
  // but using graph.instagram.com for the newer Instagram Basic Display / Graph APIs.
  const fields = 'id,username,name,profile_picture_url,biography,followers_count,follows_count,media_count';
  const url = `${API_BASE}/me?fields=${fields}&access_token=${token}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    const error = await res.text();
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch Instagram profile');
  }

  return res.json();
}

export async function getRecentMedia(): Promise<InstagramMedia[]> {
  const token = await getToken();

  const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count';
  const url = `${API_BASE}/me/media?fields=${fields}&limit=12&access_token=${token}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    const error = await res.text();
    console.error('Error fetching media:', error);
    throw new Error('Failed to fetch Instagram media');
  }

  const data = await res.json();
  return data.data;
}

export async function getInsights() {
  const token = await getToken();
  // Simplified insights fetching for available metrics
  const metrics = 'impressions,reach,profile_views';
  // Note: Insights API often requires user ID or page ID depending on exact endpoint
  // Using a simplified me/insights if available, or returning mock-like structure of real data format if specific endpoint requires precise biz account setup.
  // The actual endpoint is usually `/{ig-user-id}/insights`. Since we are `me`, we must resolve `me` first if needed.

  try {
    const profile = await getProfile();
    const url = `${API_BASE}/${profile.id}/insights?metric=${metrics}&period=day&access_token=${token}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
        // If insights fail (e.g. not a business account), return empty gracefully
        console.warn('Insights fetch failed. This might not be a business account.');
        return [];
    }
    const data = await res.json();
    return data.data;
  } catch (e) {
      console.error(e);
      return [];
  }
}

export async function createMediaContainer(imageUrl: string, caption: string): Promise<string> {
    const token = await getToken();
    const profile = await getProfile();

    const url = `${API_BASE}/${profile.id}/media`;
    const formData = new URLSearchParams();
    formData.append('image_url', imageUrl);
    formData.append('caption', caption);
    formData.append('access_token', token);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Failed to create container:", err);
        throw new Error("Failed to create media container");
    }

    const data = await res.json();
    return data.id; // Returns container ID
}

export async function publishMedia(containerId: string): Promise<{id: string}> {
    const token = await getToken();
    const profile = await getProfile();

    const url = `${API_BASE}/${profile.id}/media_publish`;
    const formData = new URLSearchParams();
    formData.append('creation_id', containerId);
    formData.append('access_token', token);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Failed to publish media:", err);
        throw new Error("Failed to publish media");
    }

    return res.json();
}
