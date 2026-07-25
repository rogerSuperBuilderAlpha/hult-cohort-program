"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createTeamMember,
  loadTeamMembers,
  parseTeamMembers,
  saveTeamMembers,
  sanitizeMemberName,
  type TeamMember,
} from "@/lib/teamMembers";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

const SAVE_DEBOUNCE_MS = 400;

async function fetchMembersFromApi(): Promise<TeamMember[] | null> {
  const response = await fetch("/api/dashboard/members", { cache: "no-store" });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load team members from server.");
  }

  const data = (await response.json()) as { members?: TeamMember[] };
  return parseTeamMembers(data.members);
}

async function saveMembersToApi(members: TeamMember[]): Promise<void> {
  const response = await fetch("/api/dashboard/members", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(members),
  });

  if (!response.ok) {
    throw new Error("Failed to save team members to server.");
  }
}

export function useTeamMembers() {
  const { userId, isAuthLoaded } = useSupabaseUser();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSave = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const membersRef = useRef(members);
  const userIdRef = useRef(userId);

  membersRef.current = members;
  userIdRef.current = userId;

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    let cancelled = false;

    async function loadMembers() {
      skipNextSave.current = true;
      setIsLoaded(false);

      const local = loadTeamMembers();

      if (userId) {
        try {
          const remote = await fetchMembersFromApi();

          if (remote !== null) {
            if (remote.length > 0 || local.length === 0) {
              if (!cancelled) {
                setMembers(remote);
                saveTeamMembers(remote);
                setIsLoaded(true);
              }
              return;
            }

            if (local.length > 0) {
              await saveMembersToApi(local);
            }

            if (!cancelled) {
              setMembers(local);
              setIsLoaded(true);
            }
            return;
          }
        } catch (error) {
          console.error("Failed to load team members from Supabase:", error);
        }
      }

      if (!cancelled) {
        setMembers(local);
        setIsLoaded(true);
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoaded]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const current = membersRef.current;
      const currentUserId = userIdRef.current;

      if (currentUserId) {
        void saveMembersToApi(current).catch((error) => {
          console.error("Failed to save team members to Supabase:", error);
        });
      } else {
        saveTeamMembers(current);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [members, isLoaded]);

  const addMember = useCallback((name: string) => {
    const sanitizedName = sanitizeMemberName(name);
    if (!sanitizedName) {
      return null;
    }

    const current = membersRef.current;
    if (current.some((member) => member.name.toLowerCase() === sanitizedName.toLowerCase())) {
      return null;
    }

    const newMember = createTeamMember(sanitizedName);
    if (!newMember) {
      return null;
    }

    setMembers([...current, newMember]);
    return newMember;
  }, []);

  const removeMember = useCallback((memberId: string) => {
    const current = membersRef.current;
    const next = current.filter((member) => member.id !== memberId);
    if (next.length === current.length) {
      return false;
    }

    setMembers(next);
    return true;
  }, []);

  const memberNames = members.map((member) => member.name);

  return {
    members,
    memberNames,
    isLoaded: isLoaded && isAuthLoaded,
    addMember,
    removeMember,
  };
}
