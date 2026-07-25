"use client";

import { useAuth } from "@/components/AuthProvider";

/** @deprecated Use useAuth from AuthProvider instead. */
export function useSupabaseUser() {
  return useAuth();
}
