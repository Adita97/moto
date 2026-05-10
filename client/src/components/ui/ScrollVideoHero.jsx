import { useScrollVideo } from "../../hooks/useScrollVideo";

/**
 * Full-bleed hero media container — scroll-driven <video> with image fallback.
 *
 * Video mode: container height is auto-sized from the video duration so the
 * full clip maps exactly to the sticky scroll range. No height prop needed.
 *
 * Image mode: falls back to a Ken-Burns animated image using `fallbackHeight`.
 */
export default function ScrollVideoHero({
  videoSrc,
  posterSrc,
  alt = "Hero",
  fallbackHeight = "100vh",
}) {
  const { containerRef, videoRef, containerHeight } = useScrollVideo();

  // Video: use dynamic height (show 100vh while metadata loads so layout is stable).
  // Image: fixed fallback height.
  const height = videoSrc
    ? containerHeight
      ? `${containerHeight}px`
      : "100vh"
    : fallbackHeight;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-clip"
      style={{ height }}
    >
      {/* Sticky inner keeps the media pinned while the outer scrolls */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : posterSrc ? (
          <img
            src={posterSrc}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover animate-hero-zoom"
          />
        ) : null}

        {/* Gradient overlay */}
        <div className="gradient-hero absolute inset-0" />
      </div>
    </div>
  );
}
