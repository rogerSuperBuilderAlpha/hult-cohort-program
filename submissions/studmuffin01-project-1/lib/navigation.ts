/** Primary sidebar navigation destinations. */

export interface SidebarNavItem {
  href: string;
  label: string;
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { href: "/start-new-initiative", label: "Start New Initiative" },
  { href: "/team-members", label: "Team Members" },
  { href: "/member-status", label: "Member Status" },
  { href: "/action-items", label: "Action Items" },
  { href: "/motivate-a-friend", label: "Motivate A Friend" },
  { href: "/top-performers", label: "Top Performers" },
];

/** Legacy bookmarks that redirect to current routes; still require auth. */
export const LEGACY_AUTH_PATHS = ["/my-status", "/top-ten-performers"];

export const AUTH_REQUIRED_PATHS = [
  "/",
  ...SIDEBAR_NAV_ITEMS.map((item) => item.href),
  ...LEGACY_AUTH_PATHS,
];

export function isAuthRequiredPath(pathname: string): boolean {
  if (AUTH_REQUIRED_PATHS.includes(pathname)) {
    return true;
  }

  return pathname.startsWith("/initiatives/");
}
