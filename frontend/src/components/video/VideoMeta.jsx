import { Card } from "../ui/card.jsx";

function VideoMeta({ video }) {
  return (
    <div className="mt-5">
      <h1 className="text-2xl font-bold">{video.title}</h1>

      <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
        <span>{video.views} views</span>

        {new Date(video.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>

      <Card className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="space-y-4">
          <h3 className="mb-4 text-lg font-semibold text-white">Description</h3>

          <p className="leading-7 text-slate-300">{video.description}</p>

          <button className="text-sm font-medium text-slate-400 hover:text-white">
            Show more ▼
          </button>
        </div>
      </Card>
    </div>
  );
}

export default VideoMeta;
