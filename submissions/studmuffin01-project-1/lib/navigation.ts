/** Primary sidebar navigation destinations. */

export interface SidebarNavItem {
  href: string;
  label: string;
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { href: "/start-new-initiative", label: "Start New Initiative" },
  { href: "/cohorts-status", label: "Cohort's Status" },
  { href: "/my-status", label: "My Status" },
  { href: "/action-items", label: "Action Items" },
  { href: "/motivate-a-friend", label: "Motivate A Friend" },
  { href: "/top-ten-performers", label: "Top Ten Performers" },
  { href: "/top-ten-motivators", label: "Top Ten Motivators" },
];
