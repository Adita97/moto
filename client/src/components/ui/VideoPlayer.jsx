import ReactPlayer from "react-player";

export default function VideoPlayer({ url, playing = false }) {
  return (
    <div className="aspect-video w-full bg-black">
      <ReactPlayer
        url={url}
        playing={playing}
        controls
        width="100%"
        height="100%"
        config={{
          youtube: {
            playerVars: { rel: 0 },
          },
        }}
      />
    </div>
  );
}
