"use client"

import { useState } from "react"
import { Play, XIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Safari } from "@/components/ui/safari"

interface SafariHeroVideoProps {
  imageSrc: string
  videoSrc?: string
  url?: string
  className?: string
}

// Composes Safari (browser-chrome frame) with HeroVideoDialog's play-button +
// fullscreen modal behavior. Neither shadcn/magicui component accepts children,
// so they can't nest directly — this reimplements the modal piece instead of
// forking the vendored HeroVideoDialog file.
export function SafariHeroVideo({ imageSrc, videoSrc, url = "app.eazypost.cm", className }: SafariHeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <div className={`relative ${className ?? ""}`}>
      <button
        type="button"
        aria-label="Play video"
        className="group relative w-full cursor-pointer border-0 bg-transparent p-0"
        onClick={() => setIsVideoOpen(true)}
      >
        <Safari
          imageSrc={imageSrc}
          url={url}
          className="w-full transition-all duration-200 ease-out group-hover:brightness-[0.85]"
        />
        <div className="absolute inset-0 flex scale-[0.9] items-center justify-center transition-all duration-200 ease-out group-hover:scale-100">
          <div className="bg-primary/10 flex size-16 md:size-24 items-center justify-center rounded-full backdrop-blur-md">
            <div className="from-primary/30 to-primary relative flex size-12 md:size-16 scale-100 items-center justify-center rounded-full bg-linear-to-b shadow-md transition-all duration-200 ease-out group-hover:scale-[1.15]">
              <Play
                className="size-6 md:size-8 scale-100 fill-white text-white transition-transform duration-200 ease-out group-hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
                }}
              />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                setIsVideoOpen(false)
              }
            }}
            onClick={() => setIsVideoOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close video"
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-12 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md hover:bg-neutral-900/70 transition-colors"
              >
                <XIcon className="size-5" />
              </button>
              <div className="relative isolate z-1 size-full overflow-hidden rounded-2xl border-2 border-white">
                {videoSrc ? (
                  <iframe
                    src={videoSrc}
                    title="Hero Video player"
                    className="mt-0 size-full rounded-2xl"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-neutral-900 text-white/60 text-sm font-medium">
                    Video coming soon
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
