import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InstagramProfile } from '@/lib/instagram';
import { Users, Image as ImageIcon, Heart } from 'lucide-react';

export function ProfileCard({ profile }: { profile: InstagramProfile }) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.profile_picture_url} alt={profile.username} />
          <AvatarFallback>{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">{profile.name || profile.username}</h2>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
      </CardHeader>
      <CardContent>
        {profile.biography && (
          <p className="mb-6 text-sm">{profile.biography}</p>
        )}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center p-2 bg-secondary rounded-lg">
            <Users className="h-4 w-4 mb-2 text-muted-foreground" />
            <span className="text-xl font-bold">{profile.followers_count?.toLocaleString() || '-'}</span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary rounded-lg">
            <Users className="h-4 w-4 mb-2 text-muted-foreground" />
            <span className="text-xl font-bold">{profile.follows_count?.toLocaleString() || '-'}</span>
            <span className="text-xs text-muted-foreground">Following</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary rounded-lg">
            <ImageIcon className="h-4 w-4 mb-2 text-muted-foreground" />
            <span className="text-xl font-bold">{profile.media_count?.toLocaleString() || '-'}</span>
            <span className="text-xs text-muted-foreground">Posts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
