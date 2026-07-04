"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/** Types `text` in character by character — used for the reservation code on success. */
export function Typewriter({
  text,
  speed = 55,
  className,
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? text.length : 0);

  useEffect(() => {
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(text.length);
      return;
    }
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]);

  const done = count >= text.length;

  return (
    <span className={className} aria-label={text}>
      {text.slice(0, count)}
      {!done && <span className="animate-pulse text-muted">▋</span>}
    </span>
  );
}
