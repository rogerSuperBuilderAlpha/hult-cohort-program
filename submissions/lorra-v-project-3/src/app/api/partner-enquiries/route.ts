import { NextResponse } from "next/server";
import { logAnalyticsEvent } from "@/lib/analytics";
import { COHORT_SLUG } from "@/lib/constants";
import { clientIpFromHeaders, takeRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerEnquiryInputSchema } from "@/lib/types/enquiry";

export const runtime = "nodejs";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const limited = takeRateLimit(`partner-enquiry:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many enquiries from this network. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = PartnerEnquiryInputSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: issue
          ? `${String(issue.path[0] ?? "Form")}: ${issue.message}`
          : "Invalid enquiry.",
      },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const admin = createAdminClient();

  try {
    if (input.project_id) {
      const { data: project } = await admin
        .from("projects")
        .select("id")
        .eq("id", input.project_id)
        .eq("status", "published")
        .maybeSingle();
      if (!project) {
        return NextResponse.json(
          { error: "Selected project is not available." },
          { status: 400 },
        );
      }
    }

    if (input.participant_id) {
      const { data: participant } = await admin
        .from("profiles")
        .select("id")
        .eq("id", input.participant_id)
        .eq("profile_status", "published")
        .maybeSingle();
      if (!participant) {
        return NextResponse.json(
          { error: "Selected builder is not available." },
          { status: 400 },
        );
      }
    }

    const { data: cohort, error: cohortError } = await admin
      .from("cohorts")
      .select("id")
      .eq("slug", COHORT_SLUG)
      .maybeSingle();

    if (cohortError || !cohort) {
      return NextResponse.json(
        { error: "Cohort is not configured. Contact the team." },
        { status: 500 },
      );
    }

    const { data: enquiry, error } = await admin
      .from("partner_enquiries")
      .insert({
        cohort_id: cohort.id,
        organization: input.organization,
        contact_name: input.contact_name,
        email: input.email,
        interest_type: input.interest_type,
        project_id: input.project_id,
        participant_id: input.participant_id,
        website_url: input.website_url,
        linkedin_url: input.linkedin_url,
        message: input.message,
        status: "new",
      })
      .select("id")
      .single();

    if (error || !enquiry) {
      console.error("[partner-enquiries]", error?.message);
      return NextResponse.json(
        { error: "Could not save enquiry. Please try again." },
        { status: 500 },
      );
    }

    await logAnalyticsEvent({
      eventType: "partner_enquiry_submitted",
      projectId: input.project_id,
      metadata: {
        enquiry_id: enquiry.id,
        interest_type: input.interest_type,
        participant_id: input.participant_id,
      },
    });

    return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
  } catch (err) {
    console.error("[partner-enquiries]", err);
    return NextResponse.json(
      { error: "Could not save enquiry. Please try again." },
      { status: 500 },
    );
  }
}
