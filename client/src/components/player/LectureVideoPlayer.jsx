import React, { useEffect, useRef, useState } from "react";

const LectureVideoPlayer = ({ lecture, initialWatchTime = 0, onProgress }) => {
  const videoRef = useRef(null);
  const saveProgressTimeout = useRef(null);
  const [hasSeekedOnce, setHasSeekedOnce] = useState(false);

  // Save progress periodically
  const saveProgress = () => {
    if (!videoRef.current || !lecture?._id || typeof onProgress !== "function") return;

    const currentTime = Math.floor(videoRef.current.currentTime);
    const duration = videoRef.current.duration;
    onProgress(currentTime, duration);
  };

  // Clear any timeout/interval
  const clearProgressTimeout = () => {
    if (saveProgressTimeout.current) {
      clearInterval(saveProgressTimeout.current);
      saveProgressTimeout.current = null;
    }
  };

  // On video play, start interval to save progress every 10 seconds
  const handlePlay = () => {
    clearProgressTimeout();
    saveProgressTimeout.current = setInterval(saveProgress, 10000);
  };

  // On pause or ended, save progress immediately and clear interval
  const handlePauseOrEnded = () => {
    saveProgress();
    clearProgressTimeout();
  };

  // On video loadedmetadata, seek to initial watch time if applicable
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && initialWatchTime > 5 && !hasSeekedOnce) {
      video.currentTime = initialWatchTime;
      setHasSeekedOnce(true);
    }
  };

  // Block right-click context menu on video
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Block specific keyboard shortcuts
  useEffect(() => {
    const blockKeys = (e) => {
      // Ctrl+S / Cmd+S, Ctrl+P / Cmd+P, Ctrl+U, Ctrl+Shift+I (DevTools)
      if (
        (e.ctrlKey || e.metaKey) &&
        ["s", "p", "u"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", blockKeys);

    return () => {
      window.removeEventListener("keydown", blockKeys);
    };
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      clearProgressTimeout();
    };
  }, []);

  if (!lecture?.video?.url) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500 bg-black">
        No video available
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-md overflow-hidden shadow-lg bg-black">
      <video
        ref={videoRef}
        controls
        src={lecture.video.url}
        className="w-full h-full object-cover"
        onPlay={handlePlay}
        onPause={handlePauseOrEnded}
        onEnded={handlePauseOrEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
      />
    </div>
  );
};

export default LectureVideoPlayer;
