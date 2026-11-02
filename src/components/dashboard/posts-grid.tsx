import { InstagramMedia } from "@/lib/instagram";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Heart, ExternalLink } from "lucide-react";

export function PostsGrid({ media }: { media: InstagramMedia[] }) {
  if (!media || media.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg bg-secondary/20">
        No recent posts found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {media.map((post) => (
        <Card key={post.id} className="overflow-hidden flex flex-col">
          <div className="relative aspect-square w-full bg-secondary group">
             {/* Using media_url or thumbnail_url */}
            {(post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM') && post.media_url ? (
              <Image
                src={post.media_url}
                alt={post.caption || "Instagram post"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : post.thumbnail_url ? (
              <Image
                src={post.thumbnail_url}
                alt={post.caption || "Instagram video thumbnail"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                Media Preview
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
               {post.like_count !== undefined && (
                  <div className="flex items-center gap-2 font-semibold">
                    <Heart className="h-5 w-5 fill-white" />
                    <span>{post.like_count}</span>
                  </div>
               )}
               {post.comments_count !== undefined && (
                 <div className="flex items-center gap-2 font-semibold">
                   <MessageCircle className="h-5 w-5 fill-white" />
                   <span>{post.comments_count}</span>
                 </div>
               )}
            </div>
          </div>
          <CardContent className="flex flex-col flex-1 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
               <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
               </span>
               <Link href={post.permalink} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="h-4 w-4" />
               </Link>
            </div>
            <p className="text-sm line-clamp-3 mb-2 flex-1">
              {post.caption || "No caption"}
            </p>
            <div className="mt-auto">
               <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-[10px] uppercase rounded font-medium">
                 {post.media_type.replace('_', ' ')}
               </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
