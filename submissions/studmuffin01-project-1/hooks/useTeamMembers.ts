"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createTeamMember,
  isDuplicateMember,
  loadTeamMembers,
  mergeTeamMembers,
  parseTeamMembers,
  saveTeamMembers,
  type NewTeamMemberInput,
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
  const canSaveRef = useRef(false);
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
      canSaveRef.current = false;
      skipNextSave.current = true;
      setIsLoaded(false);

      const local = loadTeamMembers();

      if (userId) {
        try {
          const remote = await fetchMembersFromApi();

          if (remote !== null) {
            const merged = mergeTeamMembers(local, remote);
            saveTeamMembers(merged);

            if (merged.length > remote.length) {
              void saveMembersToApi(merged).catch((error) => {
                console.error("Failed to sync merged team members to server:", error);
              });
            }

            if (!cancelled) {
              setMembers(merged);
              skipNextSave.current = true;
              canSaveRef.current = true;
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
        skipNextSave.current = true;
        canSaveRef.current = true;
        setIsLoaded(true);
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoaded]);

  const flushSave = useCallback(() => {
    if (!canSaveRef.current) {
      return;
    }

    const current = membersRef.current;
    const currentUserId = userIdRef.current;

    saveTeamMembers(current);

    if (currentUserId) {
      void saveMembersToApi(current).catch((error) => {
        console.error("Failed to save team members to server:", error);
      });
    }
  }, []);

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

    saveTimeoutRef.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [members, isLoaded, flushSave]);

  useEffect(() => {
    const handlePageHide = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      flushSave();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handlePageHide();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushSave]);

  const addMember = useCallback((input: NewTeamMemberInput) => {
    const current = membersRef.current;

    if (isDuplicateMember(current, input)) {
      return null;
    }

    const newMember = createTeamMember(input);
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
