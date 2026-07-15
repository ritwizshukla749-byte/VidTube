import { Link } from "react-router-dom";

function SuggestedVideoCard({ video }) {
  return (
    <Link
      to={`/watch/${video._id}`}
      className="flex gap-3 rounded-lg p-2 hover:translate-x-1 hover:bg-slate-800/50 transition-all duration-300"
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="h-28 w-48 rounded-xl object-cover"
        onError={(e) => {
          e.currentTarget.src =
            "https://placehold.co/600x338/1e293b/ffffff?text=No+Image";
        }}
      />

      <div className="flex-1">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">{video.title}</h3>

        <p className="mt-1 text-sm text-slate-400">{video.owner.fullName}</p>

        <p className="text-xs text-slate-500">{video.views} views</p>
      </div>
    </Link>
  );
}

export default SuggestedVideoCard;

