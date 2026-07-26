"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changePasswordAction, updateProfileAction } from "@/lib/actions";
import type { SessionUser } from "@/lib/auth";
import { SubmitButton } from "./SubmitButton";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function ProfileForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileOk, setProfileOk] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordOk, setPasswordOk] = useState(false);
  const [profilePending, startProfile] = useTransition();
  const [passwordPending, startPassword] = useTransition();

  return (
    <div className="stack profile-settings">
      <div className="user-chip profile-preview">
        <span className="avatar avatar-lg" aria-hidden="true">
          {initials(user.name)}
        </span>
        <div className="user-chip-text">
          <strong>{user.name}</strong>
          <div className="muted">@{user.username}</div>
        </div>
      </div>

      <form
        className="form"
        action={(fd) => {
          setProfileError(null);
          setProfileOk(false);
          startProfile(async () => {
            const result = await updateProfileAction(fd);
            if (!result.ok) {
              setProfileError(result.error);
              return;
            }
            setProfileOk(true);
            router.refresh();
          });
        }}
      >
        <h2 className="profile-section-title">Profile</h2>
        <label>
          Display name
          <input
            key={`name-${user.name}`}
            name="name"
            defaultValue={user.name}
            required
            maxLength={80}
            autoComplete="name"
          />
        </label>
        <label>
          Username
          <input
            key={`username-${user.username}`}
            name="username"
            defaultValue={user.username}
            required
            maxLength={32}
            pattern="[a-zA-Z0-9_-]+"
            autoComplete="username"
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={user.email}
            readOnly
            disabled
            autoComplete="email"
          />
        </label>
        <label>
          Role
          <input name="role" value={user.role} readOnly disabled />
        </label>
        {profileError ? (
          <p className="error" role="alert">
            {profileError}
          </p>
        ) : null}
        {profileOk ? (
          <p className="success" role="status">
            Profile saved.
          </p>
        ) : null}
        <SubmitButton>
          {profilePending ? "Saving…" : "Save profile"}
        </SubmitButton>
      </form>

      <form
        className="form"
        action={(fd) => {
          setPasswordError(null);
          setPasswordOk(false);
          startPassword(async () => {
            const result = await changePasswordAction(fd);
            if (!result.ok) {
              setPasswordError(result.error);
              return;
            }
            setPasswordOk(true);
          });
        }}
      >
        <h2 className="profile-section-title">Password</h2>
        <label>
          Current password
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        <label>
          New password
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
          />
        </label>
        {passwordError ? (
          <p className="error" role="alert">
            {passwordError}
          </p>
        ) : null}
        {passwordOk ? (
          <p className="success" role="status">
            Password updated.
          </p>
        ) : null}
        <SubmitButton className="btn-secondary">
          {passwordPending ? "Updating…" : "Change password"}
        </SubmitButton>
      </form>
    </div>
  );
}
