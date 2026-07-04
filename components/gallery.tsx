"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";
import { Ms } from "@/components/icon";

/** Button that opens a fullscreen lightbox over the given images. */
export function GalleryTrigger({
  images,
  className,
  children,
}: {
  images: (string | null | undefined)[];
  className?: string;
  children?: React.ReactNode;
}) {
  const pics = images.filter((src): src is string => Boolean(src));
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (pics.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        className={className}
      >
        {children ?? (
          <>
            <Ms name="photo_library" style={{ fontSize: 17 }} />
            {pics.length} photo{pics.length === 1 ? "" : "s"}
          </>
        )}
      </button>
      <Lightbox
        open={open}
        images={pics}
        index={index}
        setIndex={setIndex}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function Lightbox({
  open,
  images,
  index,
  setIndex,
  onClose,
}: {
  open: boolean;
  images: string[];
  index: number;
  setIndex: (updater: (i: number) => number) => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length, setIndex],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length, setIndex],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, next, prev, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.normal }}
        >
          <button
            type="button"
            aria-label="Close gallery"
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          />

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <Ms name="close" style={{ fontSize: 22 }} />
          </button>

          {images.length > 1 && (
            <>
              <NavButton side="left" onClick={prev} />
              <NavButton side="right" onClick={next} />
            </>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              className="relative h-[82vh] w-[92vw] max-w-5xl"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
              transition={{ duration: DURATION.medium, ease: EASE.out }}
              drag={images.length > 1 && !reduce ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) next();
                else if (info.offset.x > 80) prev();
              }}
            >
              <Image
                src={images[index]}
                alt=""
                fill
                sizes="92vw"
                className="pointer-events-none select-none object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <div className="rz-mono absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] tabular-nums text-white backdrop-blur">
              {index + 1} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous" : "Next"}
      onClick={onClick}
      className={`absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      <Ms name={side === "left" ? "chevron_left" : "chevron_right"} style={{ fontSize: 26 }} />
    </button>
  );
}
