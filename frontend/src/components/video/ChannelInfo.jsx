import { Card } from "../ui/card.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.jsx";
import { Badge } from "../ui/badge.jsx";


function ChannelInfo({ owner }) {
  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={owner.avatar} alt={owner.username} />

            <AvatarFallback>{owner.fullName[0]}</AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-lg font-semibold">{owner.fullName}</h2>

            <p className="text-sm text-muted-foreground">@{owner.username}</p>

            <Badge variant="secondary" className="mt-2">
              Creator
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ChannelInfo;
