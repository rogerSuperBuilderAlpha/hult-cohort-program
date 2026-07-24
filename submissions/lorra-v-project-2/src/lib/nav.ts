/** Left sidebar navigation — PRD §5 (stretch items omitted from MVP nav). */
export type NavItem = {
  href: string;
  label: string;
  stretch?: boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/messages", label: "Messages" },
  { href: "/threads", label: "Threads" },
  { href: "/teams", label: "Teams", stretch: true },
  { href: "/tasks", label: "Tasks" },
  { href: "/calendar", label: "Calendar", stretch: true },
  { href: "/files", label: "Files" },
  { href: "/ai", label: "AI Assistant", stretch: true },
];
