import { cookies } from "next/headers";
import { MainNav } from "@/components/layout/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Settings2, ShieldCheck, Clock } from "lucide-react";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ig_token');
  const isAuthenticated = !!token;

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-1 container py-8 max-w-4xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your Instagram connection and application preferences.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Connection Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Connection Status
              </CardTitle>
              <CardDescription>Manage your Instagram OAuth connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50/50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-900">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-medium">Connected to Meta Graph API</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your account is securely connected. OAuth tokens are stored in encrypted HTTP-only server cookies and never exposed to the frontend or saved in a persistent database.
                  </p>
                  <div className="pt-4 flex gap-4">
                    <Button variant="outline" asChild>
                      <Link href="/api/auth/instagram">Re-authenticate</Link>
                    </Button>
                    <Button variant="destructive" asChild>
                      <Link href="/api/auth/logout">Disconnect Account</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-900">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Not Connected</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connect your Instagram Business or Creator account to start managing your profile and publishing content.
                  </p>
                  <div className="pt-4">
                    <Button asChild>
                      <Link href="/api/auth/instagram">Connect Instagram</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Architecture & Scheduling Notice Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduling & Architecture
              </CardTitle>
              <CardDescription>Information regarding background tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="bg-secondary/50 p-4 rounded-md text-sm space-y-3">
                 <p>
                   <strong>No Persistent Database:</strong> This application strictly adheres to a direct-API architecture. Instagram is the sole source of truth for your data. No local copies of posts, analytics, or schemas are maintained.
                 </p>
                 <p>
                   <strong>Post Scheduling Limitations:</strong> Because there is no database to store future posts and no background worker built into the serverless Next.js edge architecture, <em>true offline scheduling is not supported out of the box</em>.
                 </p>
                 <p className="text-muted-foreground">
                   To achieve scheduling without a database, you would need to configure an external scheduling webhook service (like GitHub Actions, Vercel Cron, or AWS EventBridge) that triggers a secure endpoint on this application at the designated time, passing the content payload securely.
                 </p>
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
