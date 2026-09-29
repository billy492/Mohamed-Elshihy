"use client";

import { useState } from "react";

// A still and a play button until the visitor asks for the film: YouTube's
// player costs ~1MB of script and sets cookies, so it only loads on demand,
// and then from the privacy-enhanced domain.
export default function VideoFacade({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button type="button" className="video video-facade" onClick={() => setPlaying(true)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
        alt=""
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
      />
      <span className="video-play">
        <span className="video-play-icon" aria-hidden="true" />
        <span>Play the interview</span>
      </span>
      <span className="sr-only">{title}</span>
    </button>
  );
}
