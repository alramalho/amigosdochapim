"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MEDIA_BASE =
  "https://alramalhosandbox.s3.eu-west-1.amazonaws.com/amigos_do_chapim/local/site/quem-somos";

const ABOUT_VIDEOS = [
  {
    id: "clip",
    label: "Excerto dos Amigos do Chapim",
    src: `${MEDIA_BASE}/quem-somos-clip.mp4`,
    poster: `${MEDIA_BASE}/quem-somos-clip.jpg`,
  },
  {
    id: "cinematografia",
    label: "Gostas de cinematografia?",
    src: `${MEDIA_BASE}/quem-somos-cinematografia-musica.mp4`,
    poster: `${MEDIA_BASE}/quem-somos-cinematografia-musica.jpg`,
  },
  {
    id: "manifesto",
    label: "1000 euros para a tua curta",
    src: `${MEDIA_BASE}/quem-somos-manifesto.mp4`,
    poster: `${MEDIA_BASE}/quem-somos-manifesto.jpg`,
  },
];

export function AboutVideoCarousel() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const updateTrackPosition = () => {
      if (reduceMotion.matches) {
        track.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(
        Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0),
        1,
      );
      const maxShift = Math.min(window.innerWidth < 640 ? 24 : 56, window.innerWidth * 0.055);
      const shift = (0.5 - progress) * maxShift * 2;

      track.style.transform = `translate3d(${shift.toFixed(2)}px, 0, 0)`;
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateTrackPosition);
    };

    updateTrackPosition();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reduceMotion.addEventListener("change", requestUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reduceMotion.removeEventListener("change", requestUpdate);
    };
  }, []);

  const toggleVideo = async (id: string) => {
    const selectedVideo = videoRefs.current[id];
    if (!selectedVideo) return;

    Object.entries(videoRefs.current).forEach(([videoId, video]) => {
      if (videoId !== id) video?.pause();
    });

    if (selectedVideo.paused) {
      try {
        await selectedVideo.play();
      } catch {
        setPlayingId(null);
      }
    } else {
      selectedVideo.pause();
    }
  };

  return (
    <div ref={sectionRef} className="mt-10 md:mt-14" aria-label="Videos dos Amigos do Chapim">
      <div className="-mx-4 overflow-hidden px-4 py-2 md:-mx-8 md:px-8">
        <div
          ref={trackRef}
          className="flex w-max gap-4 transition-transform duration-500 ease-out will-change-transform md:gap-6"
        >
          {ABOUT_VIDEOS.map((video) => {
            const isPlaying = playingId === video.id;

            return (
              <article
                key={video.id}
                className="relative aspect-[9/16] w-[min(72vw,18rem)] shrink-0 overflow-hidden rounded-sm border border-border/70 bg-primary/5 shadow-sm sm:w-60 md:w-64 lg:w-72"
              >
                <video
                  ref={(node) => {
                    videoRefs.current[video.id] = node;
                  }}
                  className="h-full w-full object-cover"
                  poster={video.poster}
                  preload="metadata"
                  playsInline
                  controls={isPlaying}
                  onPlay={() => setPlayingId(video.id)}
                  onPause={() => {
                    if (videoRefs.current[video.id]?.ended || playingId === video.id) {
                      setPlayingId(null);
                    }
                  }}
                  onEnded={() => setPlayingId(null)}
                >
                  <source src={video.src} type="video/mp4" />
                </video>

                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 transition-opacity duration-300 ${
                    isPlaying ? "opacity-0" : "opacity-100"
                  }`}
                />

                {!isPlaying && (
                  <button
                    type="button"
                    aria-label={`Reproduzir ${video.label}`}
                    className="absolute inset-0 flex items-center justify-center text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-primary"
                    onClick={() => toggleVideo(video.id)}
                  >
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/85 shadow-lg backdrop-blur-sm transition-transform duration-200 hover:scale-105 md:h-16 md:w-16">
                      <Play className="ml-1 h-6 w-6 md:h-7 md:w-7" fill="currentColor" strokeWidth={2.25} />
                    </span>
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
