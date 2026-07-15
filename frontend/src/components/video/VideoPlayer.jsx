function VideoPlayer({ video }) {
  return (
    <video
      className="aspect-video w-full overflow-hidden rounded-3xl border border-slate-800 bg-black shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
      src={video.videofilename}
      controls
      autoPlay
    />
  );
}

export default VideoPlayer;
