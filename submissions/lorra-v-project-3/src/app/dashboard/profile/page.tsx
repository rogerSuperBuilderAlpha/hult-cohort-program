import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { requireUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const { profile } = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Your profile
        </h1>
        <p className="mt-2 text-foreground-muted">
          This is what partners and peers see on the public builders directory.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
