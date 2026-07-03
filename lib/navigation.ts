/** Customer navigation: named by user intent, not database tables. */
export const customerNavigation = [
  { href: "/", label: "Book" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
] as const;
