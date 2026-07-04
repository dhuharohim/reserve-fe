import * as React from "react";

// React's View Transitions component. Present at runtime on react@experimental
// (with Next's `experimental.viewTransition`), but not yet in @types/react — so
// bridge it with a typed cast. Route navigations are React Transitions, so two
// elements sharing a `name` morph between the old and new page automatically.
type ViewTransitionProps = {
  name?: string;
  /** Class applied to the transition when the element is shared old↔new (CSS hook). */
  share?: string;
  children?: React.ReactNode;
};

export const ViewTransition = (
  React as unknown as {
    ViewTransition: React.ComponentType<ViewTransitionProps>;
  }
).ViewTransition;
