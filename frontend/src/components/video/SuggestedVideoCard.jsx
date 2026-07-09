import { Link } from "react-router-dom";

function SuggestedVideoCard({ video }) {
  return (
    <Link
      to={`/watch/${video._id}`}
      className="flex gap-3 rounded-lg p-2 transition hover:bg-slate-900"
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="h-24 w-40 rounded-lg object-cover"
      />

      <div className="flex-1">
        <h3 className="line-clamp-2 font-semibold">{video.title}</h3>

        <p className="mt-1 text-sm text-slate-400">{video.owner.fullName}</p>

        <p className="text-xs text-slate-500">{video.views} views</p>
      </div>
    </Link>
  );
}

export default SuggestedVideoCard;

