import { cookies } from 'next/headers';
import { MainNav } from '@/components/layout/nav';
import { ProfileCard } from '@/components/dashboard/profile-card';
import { getProfile, getRecentMedia, getInsights } from '@/lib/instagram';
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts';
import { PostsGrid } from '@/components/dashboard/posts-grid';
import { PostComposer } from '@/components/composer/post-composer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ig_token');

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4">Welcome to InstaPilot</h1>
            <p className="text-muted-foreground mb-8">
              Connect your Instagram account to manage your profile, view analytics, and publish content directly.
            </p>
          </div>
        </main>
      </div>
    );
  }

  let profile = null;
  let media: any[] = [];
  let insights = [];
  let error = null;

  try {
    profile = await getProfile();
    media = await getRecentMedia();
    insights = await getInsights();
  } catch (e: any) {
    error = e.message || 'Failed to fetch data from Instagram';
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-1 container py-6 space-y-6 mx-auto px-4">
        {error ? (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md">
            Error loading Instagram data: {error}
          </div>
        ) : (
          profile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Profile & Compose */}
              <div className="space-y-6 md:col-span-1">
                <ProfileCard profile={profile} />
                <PostComposer />
              </div>

              {/* Right Column: Dashboard Tabs */}
              <div className="md:col-span-2">
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="posts">Recent Posts</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  <TabsContent value="posts" className="mt-6">
                    <PostsGrid media={media} />
                  </TabsContent>
                  <TabsContent value="analytics" className="mt-6">
                    <AnalyticsCharts data={insights} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
