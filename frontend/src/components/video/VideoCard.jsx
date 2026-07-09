import { Link } from "react-router-dom";

function VideoCard({ video }) {
  return (
    <Link to={`/watch/${video._id}`} className="group">
      <div className="overflow-hidden rounded-xl">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
          />

          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
            {Math.floor(video.duration)} sec
          </span>
        </div>

        <div className="mt-3 flex gap-3">
          <img
            src={video.owner.avatar}
            alt={video.owner.username}
            className="h-10 w-10 rounded-full"
          />

          <div>
            <h2 className="font-semibold line-clamp-2">{video.title}</h2>

            <p className="text-sm text-slate-400">{video.owner.fullName}</p>

            <p className="text-xs text-slate-500">{video.views} views</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default VideoCard;
