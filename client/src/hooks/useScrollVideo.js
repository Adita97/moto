import { useRef, useEffect, useCallback, useState } from "react";

// px of scroll travel per second of video — controls scrub pacing
const PX_PER_SECOND = 300;

/**
 * Drives a <video> element's currentTime from scroll position.
 *
 * Uses a seek-queue pattern: only one seek is in-flight at a time.
 * While the browser is seeking, the latest target is queued and applied
 * immediately after `seeked` fires — dropping stale intermediate positions.
 * This ensures the video always shows the frame for the *current* scroll offset.
 *
 * ─── For smooth per-frame scrubbing the video MUST be re-encoded ───
 * with every frame as a keyframe (otherwise browser snaps to keyframes ~1-2s apart):
 *   ffmpeg -i hero.mp4 -g 1 -bf 0 -vcodec libx264 -crf 22 -movflags +faststart hero_scrub.mp4
 */
export function useScrollVideo() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const isSeekingRef = useRef(false);
  const pendingTimeRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(null);

  const getTargetTime = useCallback(() => {
    const el = containerRef.current;
    const vid = videoRef.current;
    if (!el || !vid || !vid.duration || !isFinite(vid.duration)) return null;

    const rect = el.getBoundingClientRect();
    const scrollRange = rect.height - window.innerHeight;
    if (scrollRange <= 0) return 0;

    // 0 = container top at viewport top (sticky starts)
    // 1 = container bottom at viewport bottom (sticky ends)
    const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
    return progress * vid.duration;
  }, []);

  // Issue the seek, or store as pending if one is already in-flight
  const seekTo = useCallback((vid, time) => {
    if (isSeekingRef.current) {
      pendingTimeRef.current = time; // always overwrite with latest target
      return;
    }
    isSeekingRef.current = true;
    pendingTimeRef.current = null;
    vid.currentTime = time;
  }, []);

  // Called once per rAF — applies target for current scroll position
  const onScrollFrame = useCallback(() => {
    rafRef.current = null;
    const vid = videoRef.current;
    if (!vid) return;
    const t = getTargetTime();
    if (t !== null) seekTo(vid, t);
  }, [getTargetTime, seekTo]);

  // Throttle: schedule at most one rAF per scroll burst
  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(onScrollFrame);
  }, [onScrollFrame]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.pause();

    const onSeeked = () => {
      isSeekingRef.current = false;
      // If a newer target arrived while we were seeking, apply it now
      if (pendingTimeRef.current !== null) {
        const t = pendingTimeRef.current;
        pendingTimeRef.current = null;
        seekTo(vid, t);
      }
    };

    const onMeta = () => {
      if (!vid.duration || !isFinite(vid.duration)) return;
      setContainerHeight(window.innerHeight + PX_PER_SECOND * vid.duration);
      // Hard-snap to current scroll position on load (bypass seek queue)
      const t = getTargetTime();
      if (t !== null) {
        isSeekingRef.current = false;
        pendingTimeRef.current = null;
        vid.currentTime = t;
      }
    };

    vid.addEventListener("seeked", onSeeked);
    vid.addEventListener("loadedmetadata", onMeta);
    vid.addEventListener("loadeddata", onMeta);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      vid.removeEventListener("seeked", onSeeked);
      vid.removeEventListener("loadedmetadata", onMeta);
      vid.removeEventListener("loadeddata", onMeta);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getTargetTime, onScroll, seekTo]);

  return { containerRef, videoRef, containerHeight };
}
