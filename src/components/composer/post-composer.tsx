"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Image as ImageIcon, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export function PostComposer() {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    if (!imageUrl || !caption) {
      setError("Image URL and caption are required.");
      return;
    }

    setIsPublishing(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, caption }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish");
      }

      setSuccess(true);
      setCaption("");
      setImageUrl("");
      router.refresh(); // Refresh dashboard data from Meta
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
        <CardDescription>Publish directly to Instagram via Meta Graph API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-sm font-medium text-destructive">{error}</div>}
        {success && <div className="text-sm font-medium text-green-600">Successfully published to Instagram!</div>}

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <div className="flex gap-2">
             <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
             Note: Meta Graph API requires a public URL accessible by their servers.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="caption">Caption & Hashtags</Label>
          <Textarea
            id="caption"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
           Schedule Post
        </Button>
        <Button onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Publish Now
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
