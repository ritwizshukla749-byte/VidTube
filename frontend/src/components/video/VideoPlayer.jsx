function VideoPlayer({ video }) {
  return (
    <video
      className="aspect-video w-full rounded-xl bg-black"
      src={video.videofilename}
      controls
      autoPlay
    />
  );
}

export default VideoPlayer;
