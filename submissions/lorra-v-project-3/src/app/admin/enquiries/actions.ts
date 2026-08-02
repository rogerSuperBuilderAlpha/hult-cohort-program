"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EnquiryStatus } from "@/lib/types/enquiry";

const STATUSES: EnquiryStatus[] = ["new", "in_progress", "closed"];

export async function updateEnquiryStatusAction(
  enquiryId: string,
  status: EnquiryStatus,
): Promise<{ error?: string; success?: string }> {
  await requireAdmin();

  if (!STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("partner_enquiries")
    .update({ status })
    .eq("id", enquiryId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${enquiryId}`);
  return { success: "Status updated." };
}
