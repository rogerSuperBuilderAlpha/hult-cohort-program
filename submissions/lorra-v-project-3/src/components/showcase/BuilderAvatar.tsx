"use client";

import { useEffect, useMemo, useState } from "react";
import { githubAvatarUrlFromProfileUrl } from "@/lib/github-avatar";
import { initialsFromName } from "@/lib/slug";

type Props = {
  name: string | null | undefined;
  githubProfileUrl?: string | null;
  avatarUrl?: string | null;
  className?: string;
  /** Extra classes for the initials span. */
  initialsClassName?: string;
};

/**
 * Avatar with fallback chain:
 * GitHub avatar (from github_profile_url) → uploaded avatar_url → initials.
 */
export function BuilderAvatar({
  name,
  githubProfileUrl,
  avatarUrl,
  className = "",
  initialsClassName = "",
}: Props) {
  const githubSrc = useMemo(
    () => githubAvatarUrlFromProfileUrl(githubProfileUrl),
    [githubProfileUrl],
  );
  const uploadSrc = avatarUrl?.trim() || null;

  const [failedGithub, setFailedGithub] = useState(false);
  const [failedUpload, setFailedUpload] = useState(false);

  useEffect(() => {
    setFailedGithub(false);
    setFailedUpload(false);
  }, [githubSrc, uploadSrc]);

  const src =
    githubSrc && !failedGithub
      ? githubSrc
      : uploadSrc && !failedUpload
        ? uploadSrc
        : null;

  const alt = `${name || "Builder"} avatar`;

  if (!src) {
    return (
      <span className={initialsClassName} aria-hidden>
        {initialsFromName(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={["size-full object-cover", className].filter(Boolean).join(" ")}
      onError={() => {
        if (githubSrc && !failedGithub && src === githubSrc) {
          setFailedGithub(true);
          return;
        }
        if (uploadSrc && src === uploadSrc) {
          setFailedUpload(true);
        }
      }}
    />
  );
}
