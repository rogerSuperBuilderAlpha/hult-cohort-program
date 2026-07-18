import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppShell } from "@/components/AppShell";
import { AppearanceForm } from "@/components/AppearanceForm";
import { getSessionUser } from "@/lib/auth";
import { countUnreadNotifications, getUserPrefs } from "@/lib/db";
import {
  ACCENT_COOKIE,
  BACKGROUND_COOKIE,
  normalizeAccent,
  normalizeBackground,
  normalizeWallpaper,
  normalizeWallpaperFit,
  THEME_COOKIE,
  WALLPAPER_COOKIE,
  WALLPAPER_FIT_COOKIE,
} from "@/lib/theme";
import type { Theme } from "@/lib/types";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [prefs, unread, jar] = await Promise.all([
    getUserPrefs(user.id),
    countUnreadNotifications(user.id),
    cookies(),
  ]);

  const theme: Theme =
    (prefs?.theme as Theme) ??
    (jar.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light");
  const accent = normalizeAccent(prefs?.accent_color ?? jar.get(ACCENT_COOKIE)?.value);
  const savedBackground = prefs?.background_color ?? jar.get(BACKGROUND_COOKIE)?.value;
  const background = savedBackground
    ? normalizeBackground(savedBackground)
    : theme === "dark"
      ? "#0b1120"
      : "#f4f6fb";
  const wallpaper = normalizeWallpaper(
    prefs?.wallpaper_url ?? jar.get(WALLPAPER_COOKIE)?.value,
  );
  const wallpaperFit = normalizeWallpaperFit(
    prefs?.wallpaper_fit ?? jar.get(WALLPAPER_FIT_COOKIE)?.value,
  );

  return (
    <AppShell user={user} unread={unread}>
      <div className="grid-2">
        <section className="panel">
          <p className="brand-sub">Account</p>
          <h1 style={{ fontSize: "1.4rem" }}>Appearance</h1>
          <p className="lead">
            Personalize FlexiFlow. Your theme and accent follow you across every
            workspace.
          </p>
          <AppearanceForm
            initialTheme={theme}
            initialAccent={accent}
            initialBackground={background}
            initialWallpaper={wallpaper}
            initialWallpaperFit={wallpaperFit}
          />
        </section>

        <section className="panel">
          <h1 style={{ fontSize: "1.4rem" }}>Profile</h1>
          <div className="task-list" style={{ marginTop: "0.75rem" }}>
            <div className="row-split">
              <span className="muted">Name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="row-split">
              <span className="muted">Username</span>
              <strong>@{user.username}</strong>
            </div>
            <div className="row-split">
              <span className="muted">Email</span>
              <strong>{user.email}</strong>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
