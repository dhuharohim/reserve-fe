"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { startViewTransition } from "@/lib/view-transition";

type LinkProps = ComponentProps<typeof Link>;

/**
 * Link that navigates inside a View Transition. If `sharedName` is set, the
 * descendant marked `data-vt` is tagged with that transition name just before
 * navigation, so it morphs into the matching element on the destination page.
 * Falls back to a normal client navigation where unsupported.
 */
export function TransitionLink({
  sharedName,
  onClick,
  ...props
}: LinkProps & { sharedName?: string }) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    // Respect new-tab / modified clicks.
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    if (sharedName) {
      const shared =
        event.currentTarget.querySelector<HTMLElement>("[data-vt]") ??
        event.currentTarget.querySelector<HTMLElement>("img");
      if (shared) {
        shared.style.viewTransitionName = sharedName;
      }
    }

    const href = typeof props.href === "string" ? props.href : props.href.toString();
    startViewTransition(() => router.push(href));
  }

  return <Link {...props} onClick={handleClick} />;
}
