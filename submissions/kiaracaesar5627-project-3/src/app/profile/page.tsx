import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ProfilePageClient } from "@/components/ProfileMenu";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Your Trailmark profile preferences and customizable gradient theme settings.",
};

export default function ProfilePage() {
  return (
    <section className="section !pt-28 !pb-24">
      <PageHero
        kicker="You"
        title="Profile."
        lead="Set how you show up on this device, and customize the site gradients under Themes."
      />
      <div className="mt-10">
        <ProfilePageClient />
      </div>
    </section>
  );
}
