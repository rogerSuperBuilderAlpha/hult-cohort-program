"use client";

import { useActionState, useState, useTransition } from "react";
import {
  saveProfileAction,
  setProfileStatusAction,
  type ProfileActionState,
} from "@/app/dashboard/profile/actions";
import { AvatarField } from "@/components/dashboard/AvatarField";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Textarea } from "@/components/ui/Textarea";
import { SOCIAL_LINK_FIELDS } from "@/lib/constants";
import type { Profile } from "@/lib/types/profile";

type Props = {
  profile: Profile;
};

export function ProfileForm({ profile }: Props) {
  const [name, setName] = useState(profile.name ?? "");
  const [biography, setBiography] = useState(profile.biography ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [skills, setSkills] = useState<string[]>(profile.skills ?? []);
  const [interests, setInterests] = useState<string[]>(profile.interests ?? []);
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url ?? "");
  const [githubUrl, setGithubUrl] = useState(profile.github_profile_url ?? "");
  const [social, setSocial] = useState({
    linkedin: String(profile.social_links?.linkedin ?? ""),
    x: String(profile.social_links?.x ?? ""),
    instagram: String(profile.social_links?.instagram ?? ""),
    youtube: String(profile.social_links?.youtube ?? ""),
  });
  const [visibleToPartners, setVisibleToPartners] = useState(
    profile.visible_to_partners,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [statusMessage, setStatusMessage] = useState<ProfileActionState>(null);
  const [statusPending, startStatusTransition] = useTransition();

  const [state, action, pending] = useActionState<ProfileActionState, FormData>(
    saveProfileAction,
    null,
  );

  const flash = state?.success || state?.error || statusMessage?.success || statusMessage?.error;
  const flashIsError = Boolean(state?.error || statusMessage?.error);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-foreground-muted">Visibility</p>
          <Badge
            tone={
              profile.profile_status === "published"
                ? "accent"
                : profile.profile_status === "unpublished"
                  ? "muted"
                  : "sky"
            }
          >
            {profile.profile_status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.profile_status === "published" ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={statusPending || pending}
              onClick={() =>
                startStatusTransition(async () => {
                  const result = await setProfileStatusAction("unpublished");
                  setStatusMessage(result);
                })
              }
            >
              Unpublish
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={statusPending || pending}
              onClick={() =>
                startStatusTransition(async () => {
                  const result = await setProfileStatusAction("published");
                  setStatusMessage(result);
                })
              }
            >
              Publish profile
            </Button>
          )}
        </div>
      </div>

      <form action={action} className="space-y-6">
        <AvatarField
          userId={profile.id}
          name={name}
          value={avatarUrl}
          onChange={setAvatarUrl}
          disabled={pending}
        />
        <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={pending}
          />
          <Input
            label="Location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, country"
            disabled={pending}
          />
        </div>

        <Textarea
          label="Biography"
          name="biography"
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          rows={5}
          hint="Save before publishing. Bio needs at least 40 characters to publish."
          disabled={pending}
        />

        <TagInput
          label="Skills"
          name="skills"
          value={skills}
          onChange={setSkills}
          placeholder="e.g. Product, Next.js, Research"
          disabled={pending}
        />
        <input type="hidden" name="skills" value={JSON.stringify(skills)} />

        <TagInput
          label="Interests"
          name="interests"
          value={interests}
          onChange={setInterests}
          placeholder="e.g. Climate, EdTech"
          disabled={pending}
        />
        <input type="hidden" name="interests" value={JSON.stringify(interests)} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Website"
            name="website_url"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://"
            disabled={pending}
          />
          <Input
            label="GitHub profile"
            name="github_profile_url"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/…"
            disabled={pending}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Social links</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_LINK_FIELDS.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                name={field.key}
                type="url"
                value={social[field.key]}
                onChange={(e) =>
                  setSocial((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                placeholder={field.placeholder}
                disabled={pending}
              />
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            name="visible_to_partners"
            checked={visibleToPartners}
            onChange={(e) => setVisibleToPartners(e.target.checked)}
            className="size-4 accent-[var(--accent)]"
            disabled={pending}
          />
          Visible to partners on the public showcase
        </label>

        {flash ? (
          <p
            role="alert"
            className={[
              "rounded-md border px-3 py-2 text-sm",
              flashIsError
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-accent/40 bg-accent/10 text-accent",
            ].join(" ")}
          >
            {flash}
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
