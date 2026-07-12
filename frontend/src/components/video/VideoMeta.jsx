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

      <div className="mt-4 rounded-xl bg-slate-900 p-4">
        <p className="text-slate-300 whitespace-pre-wrap">
          {video.description}
        </p>
      </div>
    </div>
  );
}

export default VideoMeta;
